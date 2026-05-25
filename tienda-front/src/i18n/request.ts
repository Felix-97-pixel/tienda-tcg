import { getRequestConfig } from 'next-intl/server';

const DEFAULT_LOCALE = 'es-CL';

function deepMerge(target: any, source: any) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
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
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;

  // Mensajes de la tienda pública (por locale/país)
  const siteMessages = (await import(`../../messages/${locale}.json`)).default;

  // Mensajes del panel admin (siempre en español, sin variante por país)
  const adminMessages = (await import(`../../messages/admin.json`)).default;

  return {
    locale,
    // Merge: ambos archivos disponibles en todo el app (deep merge para evitar sobrescribir objetos enteros)
    messages: deepMerge(siteMessages, adminMessages),
  };
});
