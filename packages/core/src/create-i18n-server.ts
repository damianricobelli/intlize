import { Adapter } from "./adapter"
import { PARAM_NAME } from "./constants"
import type { CreateI18n } from "./create-i18n"
import type { GetLocale, LocaleType, LocalesObject } from "./create-t"

import { createT } from "./create-t"  
import { helpers } from "./helpers"

export function createI18nServer<
  LinkComponentProps extends any,
  Locales extends LocalesObject,
  Locale extends LocaleType = GetLocale<Locales>,
>(locales: Locales, config: CreateI18n.Config<Locales>, adapter: Adapter<LinkComponentProps>): CreateI18n.ServerReturn<Locales, Locale> {

  const supportedLocales = Object.keys(locales)
  const paramName = config.paramName ?? PARAM_NAME

  const localesCache = new Map<string, LocaleType>()

  async function loadData(locale: string) {
    let data = localesCache.get(locale)
    if (!data) {
      data = (await locales[locale]()).default
      localesCache.set(locale, data)
    }
    return data
  }

  return {
    t: async (request) => {
      const locale = getCookie(request, paramName)
      if (!locale) throwMissingLocaleError("t")
      const data = await loadData(locale)
      return (key, ...params) => createT(locale, data, undefined, key, ...params)
    },
    scopedT: async (scope, request) => {
      const locale = getCookie(request, paramName)
      if (!locale) throwMissingLocaleError("scopedT")
      const data = await loadData(locale)
      // @ts-expect-error - no types
      return (key, ...params) => createT(locale, data, scope, key, ...params)
    },
    resolve: (request, params) => {
      const url = new URL(request.url)
      const pathname = url.pathname
      const search = url.search

      const localeParam = params[paramName] || pathname.split("/").filter(Boolean)[0]
      const localeCookie = getCookie(request, paramName)
      const fullLocaleCookie = getCookie(request, `full_${paramName}`)

      const shouldPrefixDefault = config.prefixDefaultLocale ?? true
      const defaultLocale = config.defaultLocale as string
      const fallbackLocale = config.fallbackLocale as string

      const buildResult = (locale: string) => {
        const region = helpers.getRegionByLocale(config.regions, locale, config.fallbackLocale)
        const fullLocale = `${locale}-${region}`
        return { locale, region, fullLocale, request }
      }

      // Helper to build redirect response with new locale
      const redirectTo = (targetLocale: string) => {
        const region = helpers.getRegionByLocale(config.regions, targetLocale, config.fallbackLocale)
        const cookies = helpers.createLocaleCookies(targetLocale, region, paramName)

        const headers = new Headers()
        if (localeCookie !== targetLocale) headers.append("Set-Cookie", cookies.locale)
        if (fullLocaleCookie !== `${targetLocale}-${region}`) headers.append("Set-Cookie", cookies.fullLocale)

        // Build new URL path
        const cleanPath = localeParam ? deleteFirstSegment(pathname) : pathname.slice(1)
        const shouldPrefix = shouldPrefixDefault || targetLocale !== defaultLocale
        const prefix = shouldPrefix ? `/${targetLocale}` : ""
        const target = `${prefix}${cleanPath ? `/${cleanPath}` : ""}${search}`

        throw adapter.redirect(target, { headers })
      }

      // Case 1: Invalid locale in URL - redirect to fallback
      if (localeParam && !supportedLocales.includes(localeParam)) {
        return buildResult(fallbackLocale)
      }

      // Case 2: No locale in URL
      if (!localeParam) {
        // Don't redirect if we don't prefix default locale and cookie matches default
        if (!shouldPrefixDefault && localeCookie === defaultLocale) {
          return buildResult(defaultLocale)
        } else if (localeCookie) {
          // Redirect to default if we don't prefix it and cookie isn't default
          if (!shouldPrefixDefault && localeCookie !== defaultLocale) {
            return redirectTo(defaultLocale)
          }
          // Otherwise redirect to stored preference
          return redirectTo(localeCookie)
        }

        // No stored preference - check Accept-Language header
        const acceptLanguage = request.headers.get("accept-language") ?? ""
        const preferred = getPreferredLocaleByWeight(
          acceptLanguage,
          supportedLocales,
          defaultLocale,
          config.regions,
        )
        return redirectTo(preferred.baseLocale)
      }

      // Case 3: Check if stored full locale is valid and matches URL locale
      const fullLocaleInvalid =
        !validateFullLocaleCookie(fullLocaleCookie, config.regions) ||
        fullLocaleCookie?.split("-")[0] !== localeParam

      // Case 4: Redirect if stored locale doesn't match URL or full locale is invalid
      if (localeCookie !== localeParam || fullLocaleInvalid) {
        return redirectTo(localeParam)
      }

      // Case 5: Redirect to remove prefix for default locale if configured
      if (!shouldPrefixDefault && localeParam === defaultLocale) {
        return redirectTo(defaultLocale)
      }

      return buildResult(localeParam)
    },
  }
}

/**
 * Get the preferred locale by weight from the Accept-Language header.
 * Falls back to the default locale if no match is found.
 *
 * @param acceptLanguage - The Accept-Language header.
 * @param supportedLocales - Array of supported base locales (e.g., ['en', 'es']).
 * @param defaultLocale - The default base locale.
 * @param regions - Locale region configuration.
 * @returns The best matching base and full locale.
 */
const getPreferredLocaleByWeight = (
  acceptLanguage: string,
  supportedLocales: string[],
  defaultLocale: string,
  regions: Record<string, string[]>,
): { baseLocale: string; fullLocale: string } => {
  // Parse Accept-Language header into array of {code, weight} objects
  // e.g. "en-US,en;q=0.9,es;q=0.8" -> [{code: "en-us", weight: 1}, {code: "en", weight: 0.9}, ...]
  const parseAcceptLanguage = (header: string) =>
    header
      .split(",")
      .map((lang) => {
        const [code, q = "q=1"] = lang.trim().split(";")
        return { code: code.toLowerCase(), weight: parseFloat(q.split("=")[1] || "1") }
      })
      .sort((a, b) => b.weight - a.weight)

  // Helper to get full locale (e.g. "en-US") from base locale (e.g. "en")
  // Uses first region from regions config as default
  const resolveFullLocale = (base: string): string => {
    const regionArr = regions[base]
    return regionArr && regionArr.length > 0 ? `${base}-${regionArr[0]}` : base
  }

  // Parse and sort Accept-Language header by weight
  const languages = parseAcceptLanguage(acceptLanguage)

  // Try each language in order of preference
  for (const { code } of languages) {
    // Split into base language and region (e.g. "en-US" -> ["en", "US"])
    const [base, region] = code.split("-")
    if (!supportedLocales.includes(base)) continue

    const regionArr = regions[base]
    if (!regionArr || regionArr.length === 0) continue

    // If region matches one we support, use the exact locale
    const normalizedRegion = region?.toLowerCase()
    if (normalizedRegion && regionArr.map((r) => r.toLowerCase()).includes(normalizedRegion)) {
      return { baseLocale: base, fullLocale: code }
    }

    // Otherwise use base locale with default region
    return { baseLocale: base, fullLocale: resolveFullLocale(base) }
  }

  // Fall back to default locale if no matches
  return {
    baseLocale: defaultLocale,
    fullLocale: resolveFullLocale(defaultLocale),
  }
}

function deleteFirstSegment(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  return segments.slice(1).join("/")
}

function getCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie")?.match(`${name}=([^;]+)`)?.[1]
  return cookie
}

function throwMissingLocaleError(functionName: string): never {
  throw new Error(
    `Locale cookie not found. Please, make sure you are using shouldRedirectToLocalizedUrl before calling ${functionName}.`,
  )
}

/**
 * Validate if fullLocaleCookie is a possible option within config.regions.
 * @param fullLocaleCookie - The full locale cookie.
 * @param regions - The regions object.
 * @returns True if the full locale cookie is a possible option, false otherwise.
 */
/**
 * Validates if a full locale cookie (e.g. "en-US") matches the configured regions
 * @param fullLocaleCookie - The full locale cookie string (e.g. "en-US", "es-MX")
 * @param regions - Configuration object mapping locales to their allowed regions
 * @returns true if cookie matches config, false otherwise
 */
function validateFullLocaleCookie(
  fullLocaleCookie: string | undefined,
  regions: CreateI18n.Config<LocalesObject>["regions"],
): boolean {
  if (!fullLocaleCookie) return false

  const [base, region] = fullLocaleCookie.split("-")
  if (!base || !region) return false

  const regionConfig = regions[base]

  return regionConfig.includes(region)
}
