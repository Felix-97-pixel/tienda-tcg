import { getRequestConfig } from 'next-intl/server';

const DEFAULT_LOCALE = 'es-CL';

export default getRequestConfig(async () => {
  const locale = DEFAULT_LOCALE;

  // Mensajes de la tienda pública (por locale/país)
  const siteMessages = (await import(`../../messages/${locale}.json`)).default;

  // Mensajes del panel admin (siempre en español, sin variante por país)
  const adminMessages = (await import(`../../messages/admin.json`)).default;

  return {
    locale,
    // Merge: ambos archivos disponibles en todo el app
    messages: { ...siteMessages, ...adminMessages },
  };
});
