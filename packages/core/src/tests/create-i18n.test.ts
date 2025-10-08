import { beforeEach, describe, expect, it, vi } from "vitest"
import { createI18n } from "../create-i18n"
import type { Adapter } from "../adapter"

// Mock completo tipado para coincidir con la interfaz Adapter
const mockAdapter: Adapter<{ to: string }> = {
  useCurrentLocale: () => "en",
  usePathname: () => "/",
  useNavigate: () => vi.fn(),
  useSearchParams: () => new URLSearchParams(),
  redirect: (_url: string, opts?: any) => new Response(null, {
    status: 302,
    headers: opts?.headers,
  }),
  Link: ({ to }) => `Link(${to})`,
}

const locales = {
  en: () =>
    Promise.resolve({
      default: {
        greeting: "Hello, {name}! You have {count} {item}.",
        "item#zero": "no items",
        "item#one": "{count} item",
        "item#two": "{count} items",
        "item#few": "{count} items",
        "item#many": "{count} items",
        "item#other": "{count} items",
        "nested.hello": "Hi {who}",
        "scope.thing#one": "scoped thing",
        "scope.thing#other": "scoped things",
        "multi.vars": "{a}, {b} and {c}",
        "fallback#one": "should not see this",
        "fallback#other": "fallback plural other",
      },
    }),
  es: () =>
    Promise.resolve({
      default: {
        greeting: "¡Hola, {name}! Tienes {count} {item}.",
        "item#zero": "ningún artículo",
        "item#one": "{count} artículo",
        "item#two": "{count} artículos",
        "item#few": "{count} artículos",
        "item#many": "{count} artículos",
        "item#other": "{count} artículos",
        "nested.hello": "Hola {who}",
        "scope.thing#one": "cosa con scope",
        "scope.thing#other": "cosas con scope",
        "multi.vars": "{a}, {b} y {c}",
        "fallback#one": "no deberías ver esto",
        "fallback#other": "plural fallback otro",
      },
    }),
} as const

const config = {
  defaultLocale: "en" as const,
  fallbackLocale: "en" as const,
  regions: {
    en: ["US"],
    es: ["AR"],
  },
}

const makeRequest = (url: string, headers: Record<string, string> = {}) =>
  new Request(url, { headers })

describe("createI18n", () => {
  let i18n: any

  beforeEach(() => {
    i18n = createI18n(locales, config, mockAdapter)
  })

  describe("i18nClient", () => {
    it("t returns a function that translates keys", async () => {
      const t = await i18n.i18nClient.t()
      expect(t("greeting", { name: "Chris", count: 2, item: "apples" })).toBe(
        "Hello, Chris! You have 2 apples.",
      )
      expect(t("item", { count: 0 })).toBe("no items")
      expect(t("item", { count: 1 })).toBe("1 item")
      expect(t("item", { count: 2 })).toBe("2 items")
      expect(t("item", { count: 99 })).toBe("99 items")
      expect(t("notfound")).toBe("notfound")
    })

    it("scopedT returns a function that translates scoped keys", async () => {
      const getScoped = await i18n.i18nClient.scopedT("scope")
      expect(getScoped("thing", { count: 1 })).toBe("scoped thing")
      expect(getScoped("thing", { count: 3 })).toBe("scoped things")
      expect(getScoped("notfound")).toBe("notfound")
    })

    it("currentLocale returns the current locale (default)", () => {
      expect(i18n.i18nClient.currentLocale()).toBe("en")
    })

    it("caches loaded locales and does not reload on repeat", async () => {
      const spy = vi.fn(locales.en)
      const i18nCache = createI18n({ ...locales, en: spy }, config, mockAdapter)
      const t1 = await i18nCache.i18nClient.t()
      t1("greeting")
      const t2 = await i18nCache.i18nClient.t()
      t2("greeting")
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe("i18nServer", () => {
    it("t returns a function that translates keys", async () => {
      const t = await i18n.i18nServer.t(makeRequest("https://host/en", { cookie: "locale=en" }))
      expect(t("greeting", { name: "Chris", count: 2, item: "apples" })).toBe(
        "Hello, Chris! You have 2 apples.",
      )
    })

    it("scopedT returns a function that translates scoped keys", async () => {
      const scopedT = await i18n.i18nServer.scopedT(
        "scope",
        makeRequest("https://host/en", { cookie: "locale=en" }),
      )
      expect(scopedT("thing", { count: 1 })).toBe("scoped thing")
    })

    describe("i18nServer.resolve", () => {
      it("returns locale info when supported locale matches cookie", () => {
        const instance = createI18n(locales, { ...config, prefixDefaultLocale: false }, mockAdapter)
        const req = makeRequest("https://host/", { cookie: "locale=en" })
        const redirect = instance.i18nServer.resolve(req, {})
        expect(redirect.locale).toBe("en")
        expect(redirect.region).toBe("US")
      })

      it("redirects to fallback when locale is not supported", () => {
        const instance = createI18n(locales, { ...config, prefixDefaultLocale: true }, mockAdapter)
        const req = makeRequest("https://host/fr", { cookie: "locale=fr" })
        const redirect = instance.i18nServer.resolve(req, {})
        expect(redirect.locale).toBe(config.fallbackLocale)
        expect(redirect.region).toBe(config.regions[config.fallbackLocale][0])
      })
    })

    it("caches loaded locales and does not reload on repeat (server)", async () => {
      const spy = vi.fn(locales.en)
      const i18nCache = createI18n({ ...locales, en: spy }, config, mockAdapter)
      const t1 = await i18nCache.i18nServer.t(makeRequest("https://host/en", { cookie: "locale=en" }))
      t1("greeting")
      const t2 = await i18nCache.i18nServer.t(makeRequest("https://host/en", { cookie: "locale=en" }))
      t2("greeting")
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
