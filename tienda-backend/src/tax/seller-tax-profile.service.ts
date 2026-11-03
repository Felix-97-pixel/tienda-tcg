import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SellerTaxProfile {
  storeId: string;
  storeName: string;
  sellerRut: string | null;
  sellerLegalName: string | null;
}

@Injectable()
export class SellerTaxProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la información tributaria y legal de la empresa propietaria de una sucursal/tienda.
   * En Chile, el RUT y la Razón Social residen en la entidad jurídica (Company).
   */
  async getForStore(storeId: string): Promise<SellerTaxProfile> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        company: {
          select: {
            rut: true,
            legalName: true,
            name: true,
          },
        },
      },
    });

    if (!store) {
      return {
        storeId,
        storeName: 'Tienda',
        sellerRut: null,
        sellerLegalName: null,
      };
    }

    return {
      storeId: store.id,
      storeName: store.name,
      sellerRut: store.company?.rut ?? null,
      sellerLegalName: store.company?.legalName ?? store.company?.name ?? store.name,
    };
  }

  /**
   * Obtiene los perfiles tributarios por lote para un conjunto de sucursales.
   */
  async getForStores(storeIds: string[]): Promise<Map<string, SellerTaxProfile>> {
    const profiles = new Map<string, SellerTaxProfile>();
    const stores = await this.prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: {
        id: true,
        name: true,
        company: {
          select: {
            rut: true,
            legalName: true,
            name: true,
          },
        },
      },
    });

    for (const s of stores) {
      profiles.set(s.id, {
        storeId: s.id,
        storeName: s.name,
        sellerRut: s.company?.rut ?? null,
        sellerLegalName: s.company?.legalName ?? s.company?.name ?? s.name,
      });
    }

    return profiles;
  }
}

