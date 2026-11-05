import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { routing, Locale } from './routing';

// Importaciones estáticas para garantizar compatibilidad total con Turbopack y Webpack
import esCommon from '../../messages/es/common.json';
import esNav from '../../messages/es/nav.json';
import esShop from '../../messages/es/shop.json';
import esAuth from '../../messages/es/auth.json';
import esBuylist from '../../messages/es/buylist.json';
import esAdmin from '../../messages/es/admin.json';
import esLegal from '../../messages/es/legal.json';
import esErrors from '../../messages/es/errors.json';

import enCommon from '../../messages/en/common.json';
import enNav from '../../messages/en/nav.json';
import enShop from '../../messages/en/shop.json';
import enAuth from '../../messages/en/auth.json';
import enBuylist from '../../messages/en/buylist.json';
import enAdmin from '../../messages/en/admin.json';
import enLegal from '../../messages/en/legal.json';
import enErrors from '../../messages/en/errors.json';

import ptCommon from '../../messages/pt/common.json';
import ptNav from '../../messages/pt/nav.json';
import ptShop from '../../messages/pt/shop.json';
import ptAuth from '../../messages/pt/auth.json';
import ptBuylist from '../../messages/pt/buylist.json';
import ptAdmin from '../../messages/pt/admin.json';
import ptLegal from '../../messages/pt/legal.json';
import ptErrors from '../../messages/pt/errors.json';

function deepMerge(target: any, source: any) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// 1. Mensajes base en español (garantía de integridad 100%)
const esBase: Record<string, any> = deepMerge(
  {
    common: esCommon,
    buylist: esBuylist,
    errors: esErrors,
    ...esNav,
    ...esShop,
    ...esAuth,
    ...esAdmin,
    ...esLegal,
  },
  {}
);

// 2. Mensajes en inglés con fallback automático a español
const enBase: Record<string, any> = deepMerge(esBase, {
  common: enCommon,
  buylist: enBuylist,
  errors: enErrors,
  ...enNav,
  ...enShop,
  ...enAuth,
  ...enAdmin,
  ...enLegal,
});

// 3. Mensajes en portugués con fallback automático a español
const ptBase: Record<string, any> = deepMerge(esBase, {
  common: ptCommon,
  buylist: ptBuylist,
  errors: ptErrors,
  ...ptNav,
  ...ptShop,
  ...ptAuth,
  ...ptAdmin,
  ...ptLegal,
});

const MESSAGES_BY_LOCALE: Record<string, any> = {
  es: esBase,
  en: enBase,
  pt: ptBase,
};

function normalizeLocale(raw?: string | null): Locale {
  if (!raw) return 'es';
  const clean = raw.toLowerCase().trim();
  if (clean.startsWith('en')) return 'en';
  if (clean.startsWith('pt')) return 'pt';
  return 'es';
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale) {
    try {
      const cookieStore = await cookies();
      const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
      if (cookieLocale) {
        locale = cookieLocale;
      }
    } catch {}
  }

  if (!locale) {
    try {
      const headerStore = await headers();
      const acceptLang = headerStore.get('accept-language')?.toLowerCase() || '';
      locale = acceptLang;
    } catch {}
  }

  const resolvedLocale = normalizeLocale(locale);
  const messages = MESSAGES_BY_LOCALE[resolvedLocale] || esBase;

  return {
    locale: resolvedLocale,
    messages,
  };
});
