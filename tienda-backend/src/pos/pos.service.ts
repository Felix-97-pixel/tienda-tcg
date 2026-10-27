import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePosSaleDto } from './dto/create-pos-sale.dto';
import { OpenShiftDto, CloseShiftDto } from './dto/pos-shift.dto';
import { SyncOfflineSalesDto } from './dto/sync-offline-sales.dto';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la tasa de cambio aplicable a un juego TCG para la tienda dada:
   * 1. Revisa si la tienda tiene una tasa propia configurada para ese juego (StoreGameExchangeRate)
   * 2. Si no, busca la tasa global del juego en pesos chilenos (GlobalGameExchangeRate)
   * 3. Fallback a 1000 CLP/USD si no hay configuración
   */
  private resolveExchangeRate(
    gameId: string | undefined | null,
    storeRates: { gameId: string; rate: any }[],
    globalRates: { gameId: string; rate: any }[],
  ): number {
    if (!gameId) return 1000;
    const storeRate = storeRates.find((r) => r.gameId === gameId);
    if (storeRate) return Number(storeRate.rate);
    const globalRate = globalRates.find((r) => r.gameId === gameId);
    if (globalRate) return Number(globalRate.rate);
    return 1000;
  }

  /**
   * Transforma y normaliza un producto para el POS:
   * Convierte los precios de USD a CLP usando la tasa de cambio vigente de la tienda / juego.
   * Si no es producto TCG (ej: sellado o accesorios), mantiene su precio en CLP directo.
   */
  private formatProductForPos(
    product: any,
    storeRates: { gameId: string; rate: any }[],
    globalRates: { gameId: string; rate: any }[],
  ) {
    const isTcg = Boolean(product.category?.isTcg || product.cardDetail);
    const gameId = product.cardDetail?.gameId;
    const rate = isTcg ? this.resolveExchangeRate(gameId, storeRates, globalRates) : 1;

    const items = (product.items || []).map((item: any) => {
      const rawPrice = Number(item.price || 0);
      const convertedPrice = isTcg ? Math.round(rawPrice * rate) : Math.round(rawPrice);
      return {
        ...item,
        rawPriceUsd: isTcg ? rawPrice : undefined,
        exchangeRateApplied: isTcg ? rate : undefined,
        price: convertedPrice, // Precio normalizado en CLP
      };
    });

    return {
      ...product,
      isTcg,
      exchangeRateApplied: isTcg ? rate : undefined,
      items,
    };
  }

  /**
   * Búsqueda híbrida para el POS:
   * 1. Si coincide exactamente con un código de barras (barcode), retorna el producto sellado de inmediato.
   * 2. Si es texto, busca en nombre, sku o edición/número de cartas singles que pertenezcan a la tienda.
   * Aplica la tasa de cambio vigente a los singles para retornar precios en CLP.
   */
  async searchProducts(storeId: string, query: string) {
    const trimmed = (query || '').trim();

    const [storeRates, globalRates] = await Promise.all([
      this.prisma.storeGameExchangeRate.findMany({ where: { storeId } }),
      this.prisma.globalGameExchangeRate.findMany({ where: { currencyCode: 'CLP' } }),
    ]);

    // 1. Verificación por código de barras exacto (EAN-13, UPC)
    if (trimmed.length >= 6) {
      const barcodeMatch = await this.prisma.product.findFirst({
        where: {
          barcode: trimmed,
          isDeleted: false,
          OR: [{ storeId: null }, { storeId }],
          items: {
            some: {
              storeId,
            },
          },
        },
        include: {
          category: true,
          brand: true,
          cardDetail: true,
          items: {
            where: { storeId },
            include: { condition: true, language: true, finish: true },
            orderBy: [{ stock: 'desc' }, { price: 'asc' }],
          },
        },
      });

      if (barcodeMatch) {
        return {
          type: 'BARCODE_MATCH',
          products: [this.formatProductForPos(barcodeMatch, storeRates, globalRates)],
        };
      }
    }

    // 2. Búsqueda por texto (nombre, SKU, set, número de coleccionista)
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const whereClause: any = {
      isDeleted: false,
      items: {
        some: {
          storeId,
        },
      },
      OR: [{ storeId: null }, { storeId }],
    };

    if (tokens.length > 0) {
      whereClause.AND = tokens.map((token) => ({
        OR: [
          { name: { contains: token, mode: 'insensitive' } },
          { sku: { contains: token, mode: 'insensitive' } },
          { barcode: { contains: token, mode: 'insensitive' } },
          { cardDetail: { expansion: { contains: token, mode: 'insensitive' } } },
          { cardDetail: { collectorNum: { contains: token, mode: 'insensitive' } } },
        ],
      }));
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      take: 30,
      include: {
        category: true,
        brand: true,
        cardDetail: true,
        items: {
          where: { storeId },
          include: { condition: true, language: true, finish: true },
          orderBy: [{ stock: 'desc' }, { price: 'asc' }],
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      type: 'SEARCH_RESULTS',
      products: products.map((p) => this.formatProductForPos(p, storeRates, globalRates)),
    };
  }

  /**
   * Procesa la venta presencial de forma atómica:
   * - Valida y descuenta stock en tiempo real de InventoryItem (sin permitir negativos).
   * - Si se usó Store Credit, debita el saldo y crea StoreCreditTransaction.
   * - Crea la orden con origin: POS_IN_STORE, entrega inmediata (DELIVERED) y courier presencial ($0).
   * - Acumula las ventas en el turno de caja activo (CashShift).
   * - NO abona a WalletTransaction en custodia (el dinero lo percibió la tienda físicamente).
   */
  async processSale(storeId: string, cashierName: string, dto: CreatePosSaleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El ticket de venta debe contener al menos un producto.');
    }

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Obtener turno de caja abierto o inicializar uno automáticamente
    let currentShift = await this.prisma.cashShift.findFirst({
      where: { storeId, status: 'OPEN' },
    });

    if (!currentShift) {
      currentShift = await this.prisma.cashShift.create({
        data: {
          storeId,
          cashierName: cashierName || dto.cashierName || 'Cajero',
          initialCash: 0,
          expectedCash: 0,
          status: 'OPEN',
        },
      });
    }

    // Ejecutar transacción atómica en PostgreSQL
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validar y decrementar stock de cada ítem
      for (const item of dto.items) {
        const invItem = await tx.inventoryItem.findFirst({
          where: { id: item.inventoryItemId, storeId },
        });

        if (!invItem) {
          throw new BadRequestException(`Ítem de inventario no encontrado para "${item.name}".`);
        }

        if (invItem.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.name}". Solicitado: ${item.quantity}, Disponible: ${invItem.stock}`,
          );
        }

        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 2. Si se utilizó Store Credit, debitar saldo del usuario registrado
      if (dto.storeCreditAmount && dto.storeCreditAmount > 0 && dto.userId) {
        const creditRecord = await tx.storeCredit.findUnique({
          where: { storeId_userId: { storeId, userId: dto.userId } },
        });

        const currentBalance = Number(creditRecord?.balance || 0);
        if (currentBalance < dto.storeCreditAmount) {
          throw new BadRequestException(
            `El cliente no tiene suficiente crédito en tienda. Saldo: $${currentBalance}, requerido: $${dto.storeCreditAmount}`,
          );
        }

        await tx.storeCredit.update({
          where: { storeId_userId: { storeId, userId: dto.userId } },
          data: { balance: { decrement: dto.storeCreditAmount } },
        });

        await tx.storeCreditTransaction.create({
          data: {
            storeId,
            userId: dto.userId,
            amount: -dto.storeCreditAmount,
            type: 'PURCHASE',
            reference: `Compra POS Mostrador`,
          },
        });
      }

      // 3. Crear Orden Maestra y Sub-orden de tienda
      const buyOrder = `POS-${Date.now()}`.slice(0, 26);
      const totalNum = Number(dto.totalAmount);

      const order = await tx.order.create({
        data: {
          buyOrder,
          userId: dto.userId || null,
          email: dto.customerEmail || `pos@${store.subdomain}.taptrade.cl`,
          name: dto.customerName || 'Cliente Mostrador',
          phone: dto.customerRut || null,
          totalAmount: totalNum,
          currencyCode: 'CLP',
          status: 'PAID',
          origin: 'POS_IN_STORE',
          posPaymentMethod: dto.paymentMethod,
          posVoucherRef: dto.voucherRef || null,
          posCashierName: cashierName || dto.cashierName || 'Cajero',
          cashShiftId: currentShift.id,
          vendorOrders: {
            create: {
              storeId,
              subtotal: totalNum,
              shippingCost: 0,
              status: 'PAID',
              deliveryStatus: 'DELIVERED',
              shippingCourier: 'POS_PRESENCIAL',
              trackingNumber: 'VENTA-MOSTRADOR',
              dispatchedAt: new Date(),
              items: {
                create: dto.items.map((i) => ({
                  productId: i.productId,
                  inventoryItemId: i.inventoryItemId,
                  productName: i.name,
                  quantity: i.quantity,
                  unitPrice: i.unitPrice,
                })),
              },
            },
          },
        },
        include: {
          vendorOrders: {
            include: { items: true },
          },
        },
      });

      // 4. Actualizar acumuladores del turno de caja activo
      const shiftUpdate: any = {};
      if (dto.paymentMethod === 'CASH') {
        shiftUpdate.expectedCash = { increment: totalNum };
      } else if (dto.paymentMethod === 'CARD_POS') {
        shiftUpdate.cardTotal = { increment: totalNum };
      } else if (dto.paymentMethod === 'TRANSFER') {
        shiftUpdate.transferTotal = { increment: totalNum };
      } else if (dto.paymentMethod === 'STORE_CREDIT') {
        shiftUpdate.creditTotal = { increment: totalNum };
      } else if (dto.paymentMethod === 'MIXED') {
        const creditPart = Number(dto.storeCreditAmount || 0);
        const cardPart = Math.max(0, totalNum - creditPart);
        if (creditPart > 0) shiftUpdate.creditTotal = { increment: creditPart };
        if (cardPart > 0) shiftUpdate.cardTotal = { increment: cardPart };
      }

      await tx.cashShift.update({
        where: { id: currentShift.id },
        data: shiftUpdate,
      });

      return {
        success: true,
        order,
        shiftId: currentShift.id,
      };
    });
  }

  /**
   * Consulta el estado del turno actual y métricas de venta acumuladas.
   */
  async getCurrentShift(storeId: string) {
    const shift = await this.prisma.cashShift.findFirst({
      where: { storeId, status: 'OPEN' },
      include: {
        orders: {
          select: {
            id: true,
            buyOrder: true,
            totalAmount: true,
            posPaymentMethod: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    return shift;
  }

  /**
   * Abre un nuevo turno de caja con fondo inicial en efectivo para vuelto.
   */
  async openShift(storeId: string, cashierName: string, dto: OpenShiftDto) {
    const existing = await this.prisma.cashShift.findFirst({
      where: { storeId, status: 'OPEN' },
    });

    if (existing) {
      return existing;
    }

    return await this.prisma.cashShift.create({
      data: {
        storeId,
        cashierName: cashierName || dto.cashierName || 'Cajero',
        initialCash: dto.initialCash,
        expectedCash: dto.initialCash,
        status: 'OPEN',
      },
    });
  }

  /**
   * Cierra el turno de caja actual y genera el arqueo:
   * Calcula descuadre entre efectivo esperado vs. contado físicamente.
   */
  async closeShift(storeId: string, dto: CloseShiftDto) {
    const shift = await this.prisma.cashShift.findFirst({
      where: { storeId, status: 'OPEN' },
    });

    if (!shift) {
      throw new BadRequestException('No hay ningún turno de caja abierto para cerrar.');
    }

    const expectedCashNum = Number(shift.expectedCash || shift.initialCash);
    const actualCashNum = Number(dto.actualCash);
    const difference = actualCashNum - expectedCashNum;

    return await this.prisma.cashShift.update({
      where: { id: shift.id },
      data: {
        actualCash: actualCashNum,
        difference,
        notes: dto.notes,
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });
  }

  /**
   * Genera el snapshot liviano del catálogo para almacenar en IndexedDB en el navegador.
   * Aplica la tasa de cambio vigente de la tienda / juego para guardar precios en CLP.
   */
  async getCatalogCache(storeId: string) {
    const [storeRates, globalRates] = await Promise.all([
      this.prisma.storeGameExchangeRate.findMany({ where: { storeId } }),
      this.prisma.globalGameExchangeRate.findMany({ where: { currencyCode: 'CLP' } }),
    ]);

    const products = await this.prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [{ storeId: null }, { storeId }],
        items: {
          some: {
            storeId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        barcode: true,
        sku: true,
        imageUrl: true,
        category: {
          select: { id: true, name: true, isTcg: true },
        },
        cardDetail: {
          select: {
            expansion: true,
            rarity: true,
            collectorNum: true,
            gameId: true,
          },
        },
        items: {
          where: { storeId },
          select: {
            id: true,
            price: true,
            stock: true,
            condition: { select: { id: true, name: true, displayName: true } },
            language: { select: { id: true, name: true, code: true } },
            finish: { select: { id: true, name: true } },
          },
          orderBy: [{ stock: 'desc' }, { price: 'asc' }],
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedProducts = products.map((p) =>
      this.formatProductForPos(p, storeRates, globalRates),
    );

    return {
      timestamp: Date.now(),
      storeId,
      totalProducts: formattedProducts.length,
      products: formattedProducts,
    };
  }

  /**
   * Sincroniza un lote de ventas realizadas en modo desconectado (sin internet).
   * Procesa cada venta de forma idempotente, actualiza el inventario y audita turnos.
   */
  async syncOfflineSales(storeId: string, cashierName: string, dto: SyncOfflineSalesDto) {
    if (!dto.sales || dto.sales.length === 0) {
      return { success: true, processedCount: 0, syncedOrders: [], warnings: [] };
    }

    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Tienda no encontrada');

    let currentShift = await this.prisma.cashShift.findFirst({
      where: { storeId, status: 'OPEN' },
    });

    if (!currentShift) {
      currentShift = await this.prisma.cashShift.create({
        data: {
          storeId,
          cashierName: cashierName || 'Cajero',
          initialCash: 0,
          expectedCash: 0,
          status: 'OPEN',
        },
      });
    }

    const syncedOrders: any[] = [];
    const warnings: string[] = [];

    // Procesar cada venta del lote
    for (const sale of dto.sales) {
      // 1. Idempotencia: evitar procesar la misma venta dos veces si se reintenta
      const buyOrder = `POS-OFF-${sale.offlineId}`.slice(0, 26);
      const existingOrder = await this.prisma.order.findUnique({
        where: { buyOrder },
      });

      if (existingOrder) {
        syncedOrders.push(existingOrder);
        continue;
      }

      const totalNum = Number(sale.totalAmount);
      const offlineDate = sale.offlineCreatedAt ? new Date(sale.offlineCreatedAt) : new Date();

      try {
        await this.prisma.$transaction(async (tx) => {
          // Descontar stock
          for (const item of sale.items) {
            const inv = await tx.inventoryItem.findFirst({
              where: { id: item.inventoryItemId, storeId },
            });

            if (!inv) {
              warnings.push(`Ítem ${item.name} no encontrado en inventario online.`);
              continue;
            }

            if (inv.stock < item.quantity) {
              warnings.push(
                `Discrepancia offline: "${item.name}" tenía ${inv.stock} en línea pero se vendieron ${item.quantity} presencialmente. Stock ajustado a 0.`,
              );
            }

            await tx.inventoryItem.update({
              where: { id: item.inventoryItemId },
              data: { stock: Math.max(0, inv.stock - item.quantity) },
            });
          }

          // Crear la orden con los metadatos de sincronización offline
          const order = await tx.order.create({
            data: {
              buyOrder,
              userId: sale.userId || null,
              email: sale.customerEmail || `pos@${store.subdomain}.taptrade.cl`,
              name: sale.customerName || 'Cliente Mostrador (Offline)',
              phone: sale.customerRut || null,
              totalAmount: totalNum,
              currencyCode: 'CLP',
              status: 'PAID',
              origin: 'POS_IN_STORE',
              posPaymentMethod: sale.paymentMethod,
              posVoucherRef: sale.voucherRef || null,
              posCashierName: cashierName || sale.cashierName || 'Cajero',
              cashShiftId: currentShift.id,
              isOfflineSync: true,
              offlineCreatedAt: offlineDate,
              vendorOrders: {
                create: {
                  storeId,
                  subtotal: totalNum,
                  shippingCost: 0,
                  status: 'PAID',
                  deliveryStatus: 'DELIVERED',
                  shippingCourier: 'POS_PRESENCIAL',
                  trackingNumber: 'VENTA-MOSTRADOR-OFFLINE',
                  dispatchedAt: offlineDate,
                  items: {
                    create: sale.items.map((i) => ({
                      productId: i.productId,
                      inventoryItemId: i.inventoryItemId,
                      productName: i.name,
                      quantity: i.quantity,
                      unitPrice: i.unitPrice,
                    })),
                  },
                },
              },
            },
          });

          // Actualizar acumuladores del turno de caja
          const shiftUpdate: any = {};
          if (sale.paymentMethod === 'CASH') {
            shiftUpdate.expectedCash = { increment: totalNum };
          } else if (sale.paymentMethod === 'CARD_POS') {
            shiftUpdate.cardTotal = { increment: totalNum };
          } else if (sale.paymentMethod === 'TRANSFER') {
            shiftUpdate.transferTotal = { increment: totalNum };
          } else if (sale.paymentMethod === 'STORE_CREDIT') {
            shiftUpdate.creditTotal = { increment: totalNum };
          } else if (sale.paymentMethod === 'MIXED') {
            const creditPart = Number(sale.storeCreditAmount || 0);
            const cardPart = Math.max(0, totalNum - creditPart);
            if (creditPart > 0) shiftUpdate.creditTotal = { increment: creditPart };
            if (cardPart > 0) shiftUpdate.cardTotal = { increment: cardPart };
          }

          await tx.cashShift.update({
            where: { id: currentShift.id },
            data: shiftUpdate,
          });

          syncedOrders.push(order);
        });
      } catch (err: any) {
        warnings.push(`Error procesando venta offline ${sale.offlineId}: ${err.message}`);
      }
    }

    return {
      success: true,
      processedCount: syncedOrders.length,
      syncedOrders,
      warnings,
    };
  }
}

