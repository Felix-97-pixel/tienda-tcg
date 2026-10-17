export interface CartItemPackageInput {
  productId: string;
  quantity: number;
  productName?: string;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface PackageEstimation {
  totalItems: number;
  physicalWeightGrams: number;
  volumetricWeightGrams: number;
  chargeableWeightGrams: number;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  packagingType: 'BUBBLE_MAILER' | 'DECK_BOX' | 'PARCEL_BOX';
  description: string;
}

/**
 * Motor de Cubicaje Inteligente para Cartas y Productos TCG
 */
export function estimateTcgPackage(items: CartItemPackageInput[]): PackageEstimation {
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Singles cartas sueltas: 3g por carta + toploader y funda
  // Boosters: ~30g
  // Cajas / Decks: ~350g
  let customWeightSum = 0;
  let hasHeavyItem = false;

  for (const item of items) {
    if (item.weightGrams && item.weightGrams > 0) {
      customWeightSum += item.weightGrams * item.quantity;
      if (item.weightGrams > 100) hasHeavyItem = true;
    } else {
      // Detección heurística por nombre si no tiene peso registrado
      const name = (item.productName || '').toLowerCase();
      if (name.includes('booster box') || name.includes('caja de sobres') || name.includes('bundle') || name.includes('etb') || name.includes('elite trainer')) {
        customWeightSum += 800 * item.quantity;
        hasHeavyItem = true;
      } else if (name.includes('deck') || name.includes('carpeta') || name.includes('binder') || name.includes('playmat')) {
        customWeightSum += 350 * item.quantity;
        hasHeavyItem = true;
      } else if (name.includes('booster') || name.includes('sobre')) {
        customWeightSum += 30 * item.quantity;
      } else {
        // Carta suelta (Single TCG)
        customWeightSum += 3.5 * item.quantity;
      }
    }
  }

  // Selección de empaque y dimensiones
  let packagingType: 'BUBBLE_MAILER' | 'DECK_BOX' | 'PARCEL_BOX' = 'BUBBLE_MAILER';
  let lengthCm = 15;
  let widthCm = 10;
  let heightCm = 1;
  let basePackagingWeight = 40; // Peso del sobre acolchado + toploaders protectores

  if (hasHeavyItem || customWeightSum > 600 || totalItems > 80) {
    packagingType = 'PARCEL_BOX';
    lengthCm = 24;
    widthCm = 18;
    heightCm = 12;
    basePackagingWeight = 180;
  } else if (totalItems > 25 || customWeightSum > 150) {
    packagingType = 'DECK_BOX';
    lengthCm = 18;
    widthCm = 12;
    heightCm = 5;
    basePackagingWeight = 90;
  } else {
    // Sobre Acolchado estándar (Bubble Mailer)
    lengthCm = 15;
    widthCm = 10;
    heightCm = Math.max(1, Math.min(3, Math.ceil(totalItems / 10)));
    basePackagingWeight = 45;
  }

  const physicalWeightGrams = Math.round(customWeightSum + basePackagingWeight);
  // Cálculo de peso volumétrico estándar (L * W * H / 4000 en kg -> gramos)
  const volumetricWeightGrams = Math.round(((lengthCm * widthCm * heightCm) / 4000) * 1000);
  const chargeableWeightGrams = Math.max(physicalWeightGrams, volumetricWeightGrams);

  let description = 'Sobre Acolchado TCG con Toploaders';
  if (packagingType === 'DECK_BOX') description = 'Caja Compacta TCG Reforzada';
  if (packagingType === 'PARCEL_BOX') description = 'Caja de Encomienda TCG Blindada';

  return {
    totalItems,
    physicalWeightGrams,
    volumetricWeightGrams,
    chargeableWeightGrams,
    dimensions: { lengthCm, widthCm, heightCm },
    packagingType,
    description: `${description} (${chargeableWeightGrams}g)`,
  };
}
