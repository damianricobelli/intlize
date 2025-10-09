import type { CreateI18n } from "./create-i18n"
import type { GetLocale, LocaleType, LocalesObject } from "./create-t"    

import { createT } from "./create-t"  
import { helpers } from "./helpers"
import { Adapter } from "./adapter"
import { PARAM_NAME } from "./constants"

export function createI18nClient<
  LinkComponentProps extends any,
  Locales extends LocalesObject,
  Locale extends LocaleType = GetLocale<Locales>,
>(locales: Locales, config: CreateI18n.Config<Locales>, adapter: Adapter<LinkComponentProps>): CreateI18n.ClientReturn<Locales, Locale> {

  const localesCache = new Map<string, LocaleType>()
  const pendingPromises = new Map<string, Promise<void>>()

  const defaultLocale = config.defaultLocale as string
  const paramName = config.paramName ?? PARAM_NAME
  const shouldPrefixDefault = config.prefixDefaultLocale ?? true

  function loadLocale(locale: string) {
    const cached = localesCache.get(locale)
    if (cached) return cached

    if (pendingPromises.has(locale)) throw pendingPromises.get(locale)!

    const promise = locales[locale]().then(res => {
      localesCache.set(locale, res.default)
      pendingPromises.delete(locale)
    })
    pendingPromises.set(locale, promise)
    throw promise
  }

  return {
    t: async () => {
      const locale = adapter.useCurrentLocale()
      const data = loadLocale(locale)
      return (key, ...params) => createT(locale, data, undefined, key, ...params)
    },
    scopedT: async (scope) => {
      const locale = adapter.useCurrentLocale()
      const data = loadLocale(locale)
      // @ts-expect-error - no types
      return (key, ...params) => createT(locale, data, scope, key, ...params)
    },
    currentLocale: () => adapter.useCurrentLocale(),
    currentRegion: () => {
      const locale = adapter.useCurrentLocale()
      const region = helpers.getRegionByLocale(config.regions, locale, config.fallbackLocale)
      return `${locale}-${region}`
    },
    useChangeLocale: () => {
      const navigate = adapter.useNavigate()
      const pathname = adapter.usePathname()
      const search = adapter.useSearchParams().toString()
      const currentLocale = adapter.useCurrentLocale()

      // Remove the current locale from the path
      let pathSegments = pathname.split("/").filter(Boolean) // Split path and remove empty segments
      if (pathSegments[0] === currentLocale) {
        pathSegments = pathSegments.slice(1) // Remove locale if present as first segment
      }
      const path = "/" + pathSegments.join("/") // Rebuild path without locale

      return (locale: keyof Locales) => {
        if (locale === currentLocale) return

        locales[locale]().then(({ default: messages }) => {
          const finalLocale = locale as string
          localesCache.set(finalLocale, messages)

          const region = helpers.getRegionByLocale(config.regions, finalLocale, config.fallbackLocale)
          document.cookie = `${paramName}=${finalLocale}`
          document.cookie = `full_${paramName}=${finalLocale}-${region}`

          const shouldPrefix = shouldPrefixDefault || finalLocale !== defaultLocale
          const rawPath = `${shouldPrefix ? `/${finalLocale}` : ""}${path}${search ? `?${search}` : ""}`
          const target = helpers.normalizePath(rawPath)

          navigate(target)
        })
      }
    },
    LocaleLink: adapter.Link,
  }
}
