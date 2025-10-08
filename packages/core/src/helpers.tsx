import type { CreateI18n } from "./create-i18n";
import type { LocalesObject } from "./create-t";

const getLocalePath = <Locales extends LocalesObject>(
  to: string,
  locale: keyof Locales,
  config: CreateI18n.Config<Locales>
) => {
  const localeString = locale.toString();

  if (!to.startsWith("/")) to = "/" + to;
  if (locale === config.defaultLocale && !config.prefixDefaultLocale)
    return normalizePath(to);
  if (to.startsWith(`/${localeString}/`) || to === `/${localeString}`)
    return normalizePath(to);
  if (to === "/") return `/${localeString}`;
  return normalizePath(`/${localeString}${to}`);
};

const generateStaticLocalePaths = <Locales extends LocalesObject>(
  routes: Array<string>,
  supportedLocales: Array<string>,
  config: CreateI18n.Config<Locales>
) => {
  return routes.flatMap((route) => {
    if (config.prefixDefaultLocale) {
      return supportedLocales.map(
        (locale) => `/${locale}${route === "/" ? "" : route}`
      );
    } else {
      return [
        ...(route === "/" ? ["/"] : [route]),
        ...supportedLocales
          .filter((locale) => locale !== config.defaultLocale)
          .map((locale) => `/${locale}${route === "/" ? "" : route}`),
      ];
    }
  });
};

/**
 * Normalize path by removing duplicate slashes and trailing slashes.
 * For example:
 * - "//path///to/page//" -> "/path/to/page"
 * - "/" -> "/"
 * - "" -> "/"
 * @param p - The path to normalize.
 * @returns The normalized path.
 */
const normalizePath = (p: string) =>
  p.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";

/**
 * Check if all locales have the same keys only in development mode.
 * This is useful to catch typos in the locales.
 * @param locales - The locales object.
 */
const checkLocaleKeys = <Locales extends LocalesObject>(locales: Locales) => {
  if (process.env.NODE_ENV !== "development") return;
  const supportedLocales = Object.keys(locales);
  Promise.all(
    supportedLocales.map(async (locale) => {
      const mod = await locales[locale]();
      return { locale, keys: Object.keys(mod.default) };
    })
  ).then((results) => {
    const allKeys = new Set(results.flatMap((r) => r.keys));
    results.forEach(({ locale, keys }) => {
      const missing = Array.from(allKeys).filter((k) => !keys.includes(k));
      if (missing.length > 0) {
        console.group(
          `\x1b[31m[i18n] Missing keys in locale '${locale.toString()}'\x1b[0m`
        );
        missing.forEach((key) => console.error(key));
        console.groupEnd();
      }
    });
  });
};

const createLocaleCookies = (
  locale: string,
  region: string,
  paramName: string
) => {
  const attrs = [
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
    process.env.NODE_ENV === "production" && "Secure",
  ]
    .filter(Boolean)
    .join("; ");

  return {
    locale: `${paramName}=${locale}; ${attrs}`,
    fullLocale: `full_${paramName}=${locale}-${region}; ${attrs}`,
  };
};

/**
 * Get the region by locale from the regions object.
 * If the locale is not found, it will return the default region.
 * @param regions - The regions object.
 * @param locale - The locale.
 * @returns The region.
 */
function getRegionByLocale<Locales extends LocalesObject>(
  regions: CreateI18n.Config<Locales>["regions"],
  locale: keyof Locales,
  fallbackLocale: keyof Locales
) {
  const regionConfig = regions[locale] || regions[fallbackLocale];
  return regionConfig[0];
}

const rtlLanguages = new Set([
  "ar", // Arabic
  "arc", // Aramaic
  "ckb", // Central Kurdish (Sorani)
  "dv", // Divehi, Dhivehi, Maldivian
  "fa", // Persian (Farsi)
  "ha", // Hausa (written in Arabic script)
  "he", // Hebrew
  "khw", // Khowar
  "ks", // Kashmiri
  "ku", // Kurdish (some dialects)
  "ps", // Pashto
  "sd", // Sindhi
  "ug", // Uyghur
  "ur", // Urdu
  "yi", // Yiddish
]);

export const helpers = {
  generateStaticLocalePaths,
  getLocalePath,
  normalizePath,
  checkLocaleKeys,
  createLocaleCookies,
  getRegionByLocale,
  rtlLanguages,
};
