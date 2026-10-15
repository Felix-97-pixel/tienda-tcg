import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedProviders();
  }

  /**
   * Obtiene todos los proveedores de envío activos
   */
  async getActiveProviders() {
    return this.prisma.shippingProvider.findMany({
      where: { isActive: true },
      orderBy: { price: 'desc' }, // Muestra Chilexpress primero (más costoso)
    });
  }

  /**
   * Obtiene todos los proveedores de envío (activos e inactivos)
   */
  async getAllProviders() {
    return this.prisma.shippingProvider.findMany({
      orderBy: { price: 'desc' },
    });
  }

  /**
   * Actualiza un proveedor de envío por su ID
   */
  async updateProvider(id: string, data: { price?: number; isActive?: boolean }) {
    const provider = await this.prisma.shippingProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor de envío con ID ${id} no encontrado`);
    }

    return this.prisma.shippingProvider.update({
      where: { id },
      data: {
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  /**
   * Inicializa la tabla de proveedores si está vacía
   */
  async seedProviders() {
    try {
      const defaultProviders = [
        { name: 'RETIRO_TIENDA', price: 0.00, isActive: true },
        { name: 'CHILEXPRESS', price: 9990.00, isActive: true },
        { name: 'STARKEN', price: 6990.00, isActive: true },
      ];

      for (const prov of defaultProviders) {
        const existing = await this.prisma.shippingProvider.findFirst({
          where: { name: prov.name, storeId: null },
        });
        if (!existing) {
          await this.prisma.shippingProvider.create({
            data: prov,
          });
          console.log(`✅ Proveedor de envío ${prov.name} sembrado exitosamente`);
        }
      }
    } catch (error) {
      console.error('❌ Error al sembrar proveedores de envío:', error.message);
    }
  }
}
