import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SellerBankProfile {
  bankName: string | null;
  bankAccountType: string | null;
  bankAccountNumber: string | null;
  bankHolderRut: string | null;
  bankHolderName: string | null;
  bankEmail: string | null;
}

export interface SellerTaxProfile {
  storeId: string;
  storeName: string;
  companyId: string | null;
  sellerRut: string | null;
  sellerLegalName: string | null;
  fantasyName: string | null;
  taxActivity: string | null;
  taxAddress: string | null;
  taxCommune: string | null;
  taxRegion: string | null;
  dteEmail: string | null;
  taxClassification: 'PRIMERA_CATEGORIA_AFECTO' | 'PRIMERA_CATEGORIA_EXENTO' | string;
  siiActivityStarted: boolean;
  verificationStatus: 'PENDING_VERIFICATION' | 'PENDING_DOCS' | 'ENABLED' | 'SUSPENDED' | 'BLOCKED' | string;
  customCommissionRate: number | null;
  planCommissionRate: number | null;
  commissionCalcBase: 'NET' | 'GROSS';
  bankProfile: SellerBankProfile;
}

/**
 * Valida algorítmicamente un RUT chileno mediante Módulo 11 oficial del SII.
 */
export function validateChileanRut(rawRut: string | null | undefined): boolean {
  if (!rawRut) return false;
  const clean = rawRut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expected = 11 - (sum % 11);
  const expectedDv = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
  return dv === expectedDv;
}

/**
 * Formatea un RUT chileno al estándar XX.XXX.XXX-Y.
 */
export function formatChileanRut(rawRut: string | null | undefined): string | null {
  if (!rawRut) return null;
  const clean = rawRut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return rawRut.trim();
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

@Injectable()
export class SellerTaxProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la información tributaria, comercial y bancaria de la empresa propietaria de una tienda.
   * En Chile (modelo B2B2C), el RUT, Razón Social, Giro, Inicio de Actividades y Cuenta Bancaria
   * residen en la entidad jurídica matriz (Company).
   */
  async getForStore(storeId: string): Promise<SellerTaxProfile> {
    const map = await this.getForStores([storeId]);
    return (
      map.get(storeId) || {
        storeId,
        storeName: 'Tienda',
        companyId: null,
        sellerRut: null,
        sellerLegalName: null,
        fantasyName: null,
        taxActivity: null,
        taxAddress: null,
        taxCommune: null,
        taxRegion: null,
        dteEmail: null,
        taxClassification: 'PRIMERA_CATEGORIA_AFECTO',
        siiActivityStarted: true,
        verificationStatus: 'ENABLED',
        customCommissionRate: null,
        planCommissionRate: null,
        commissionCalcBase: 'NET',
        bankProfile: {
          bankName: null,
          bankAccountType: null,
          bankAccountNumber: null,
          bankHolderRut: null,
          bankHolderName: null,
          bankEmail: null,
        },
      }
    );
  }

  /**
   * Obtiene los perfiles tributarios, comerciales y bancarios por lote para un conjunto de sucursales.
   */
  async getForStores(storeIds: string[]): Promise<Map<string, SellerTaxProfile>> {
    const profiles = new Map<string, SellerTaxProfile>();
    if (!storeIds || storeIds.length === 0) return profiles;

    const stores = await this.prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: {
        id: true,
        name: true,
        subscriptionPlans: {
          select: { commissionRate: true },
          take: 1,
        },
        company: {
          select: {
            id: true,
            name: true,
            rut: true,
            legalName: true,
            fantasyName: true,
            taxActivity: true,
            taxAddress: true,
            taxCommune: true,
            taxRegion: true,
            dteEmail: true,
            taxClassification: true,
            siiActivityStarted: true,
            verificationStatus: true,
            customCommissionRate: true,
            commissionCalcBase: true,
            bankName: true,
            bankAccountType: true,
            bankAccountNumber: true,
            bankHolderRut: true,
            bankHolderName: true,
            bankEmail: true,
            plan: {
              select: { commissionRate: true },
            },
          },
        },
      },
    });

    for (const s of stores) {
      const c = s.company;
      const planRate =
        c?.plan?.commissionRate !== undefined && c?.plan?.commissionRate !== null
          ? Number(c.plan.commissionRate)
          : s.subscriptionPlans?.[0]?.commissionRate !== undefined
            ? Number(s.subscriptionPlans[0].commissionRate)
            : null;

      profiles.set(s.id, {
        storeId: s.id,
        storeName: s.name,
        companyId: c?.id ?? null,
        sellerRut: c?.rut ?? null,
        sellerLegalName: c?.legalName ?? c?.name ?? s.name,
        fantasyName: c?.fantasyName ?? s.name,
        taxActivity: c?.taxActivity ?? null,
        taxAddress: c?.taxAddress ?? null,
        taxCommune: c?.taxCommune ?? null,
        taxRegion: c?.taxRegion ?? null,
        dteEmail: c?.dteEmail ?? null,
        taxClassification: c?.taxClassification ?? 'PRIMERA_CATEGORIA_AFECTO',
        siiActivityStarted: c?.siiActivityStarted ?? true,
        verificationStatus: c?.verificationStatus ?? 'ENABLED',
        customCommissionRate:
          c?.customCommissionRate !== undefined && c?.customCommissionRate !== null
            ? Number(c.customCommissionRate)
            : null,
        planCommissionRate: planRate,
        commissionCalcBase: c?.commissionCalcBase === 'GROSS' ? 'GROSS' : 'NET',
        bankProfile: {
          bankName: c?.bankName ?? null,
          bankAccountType: c?.bankAccountType ?? null,
          bankAccountNumber: c?.bankAccountNumber ?? null,
          bankHolderRut: c?.bankHolderRut ?? c?.rut ?? null,
          bankHolderName: c?.bankHolderName ?? c?.legalName ?? c?.name ?? null,
          bankEmail: c?.bankEmail ?? c?.dteEmail ?? null,
        },
      });
    }

    return profiles;
  }

  /**
   * Verifica que un vendedor esté habilitado comercial y tributariamente para operar.
   */
  assertSellerEnabledForSale(profile: SellerTaxProfile): void {
    if (
      profile.verificationStatus === 'SUSPENDED' ||
      profile.verificationStatus === 'BLOCKED' ||
      profile.verificationStatus === 'PENDING_VERIFICATION' ||
      profile.verificationStatus === 'PENDING_DOCS'
    ) {
      throw new BadRequestException(
        `La tienda "${profile.storeName}" no se encuentra habilitada comercialmente para procesar ventas en este momento (Estado: ${profile.verificationStatus}).`,
      );
    }
    if (!profile.siiActivityStarted) {
      throw new BadRequestException(
        `La tienda "${profile.storeName}" no cuenta con Inicio de Actividades SII vigente para operar en el marketplace.`,
      );
    }
  }
}
