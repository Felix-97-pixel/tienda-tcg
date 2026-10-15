/**
 * Robust filtering helpers for TCG Marketplace & Storefront.
 * Evaluates conditions, finishes, and languages across multi-store items.
 */

export function matchesCondition(p: any, targetCond: string | null): boolean {
  if (!targetCond) return true;
  const target = targetCond.trim().toLowerCase();
  const targetNormalized = target.replace(/[-_\s]/g, "");

  const isCondMatch = (cond: any, condId?: string): boolean => {
    if (!cond && !condId) return false;

    // 1. Direct UUID conditionId match
    if (condId && condId === targetCond) return true;

    // 2. If object from database { id, name, displayName }
    if (cond && typeof cond === "object") {
      if (cond.id && cond.id === targetCond) return true;
      const name = (cond.name || "").toLowerCase();
      const displayName = (cond.displayName || "").toLowerCase();

      if (name === target || displayName === target) return true;
      if (name.replace(/[-_\s]/g, "") === targetNormalized) return true;
      if (displayName.replace(/[-_\s]/g, "") === targetNormalized) return true;
    }

    // 3. If string value
    if (cond && typeof cond === "string") {
      const str = cond.toLowerCase();
      return str === target || str.replace(/[-_\s]/g, "") === targetNormalized;
    }

    return false;
  };

  // Check across all inventory items for this card
  if (Array.isArray(p.items) && p.items.length > 0) {
    return p.items.some((item: any) => isCondMatch(item.condition, item.conditionId));
  }

  // Fallback to product condition fields
  return isCondMatch(p.condition_rel) || isCondMatch(p.condition);
}

export function matchesFinish(p: any, targetFinish: string | null): boolean {
  if (!targetFinish) return true;
  const target = targetFinish.toLowerCase().trim();

  const isFoilFinish = (finishObj: any): boolean => {
    if (!finishObj) return false;
    const name = (typeof finishObj === "string" ? finishObj : (finishObj.name || "")).toLowerCase();
    return name.includes("foil") || name.includes("holo");
  };

  const isNormalFinish = (finishObj: any): boolean => {
    if (!finishObj) return true; // Default unassigned is normal
    const name = (typeof finishObj === "string" ? finishObj : (finishObj.name || "")).toLowerCase();
    if (name === "normal" || name === "regular" || name === "standard" || name === "non-foil") return true;
    return !name.includes("foil") && !name.includes("holo");
  };

  if (target === "foil") {
    if (Array.isArray(p.items) && p.items.length > 0) {
      const hasFoilItem = p.items.some((i: any) => isFoilFinish(i.finish));
      if (hasFoilItem) return true;
    }
    return isFoilFinish(p.finish) || Boolean(p.cardDetail?.isFoil);
  }

  if (target === "normal") {
    if (Array.isArray(p.items) && p.items.length > 0) {
      return p.items.some((i: any) => isNormalFinish(i.finish));
    }
    return isNormalFinish(p.finish) && !Boolean(p.cardDetail?.isFoil);
  }

  return true;
}

export function matchesLanguage(p: any, targetLang: string | null): boolean {
  if (!targetLang) return true;
  const target = targetLang.trim().toLowerCase();
  const targetNormalized = target.replace(/[-_\s]/g, "");

  const isLangMatch = (langObj: any, langId?: string): boolean => {
    if (!langObj && !langId) return false;

    // 1. Direct UUID languageId match
    if (langId && langId === targetLang) return true;

    // 2. If object from database { id, name, code }
    if (langObj && typeof langObj === "object") {
      if (langObj.id && langObj.id === targetLang) return true;
      const code = (langObj.code || "").toLowerCase();
      const name = (langObj.name || "").toLowerCase();

      if (code === target || name === target) return true;
      if (code.replace(/[-_\s]/g, "") === targetNormalized) return true;
      if (name.replace(/[-_\s]/g, "") === targetNormalized) return true;
    }

    // 3. If string value
    if (langObj && typeof langObj === "string") {
      const str = langObj.toLowerCase();
      return str === target || str.replace(/[-_\s]/g, "") === targetNormalized;
    }

    return false;
  };

  // Check across all inventory items
  if (Array.isArray(p.items) && p.items.length > 0) {
    return p.items.some((i: any) => isLangMatch(i.language, i.languageId));
  }

  // Fallback to product language
  return isLangMatch(p.language);
}
