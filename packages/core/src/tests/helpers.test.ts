import { describe, expect, it } from "vitest"
import { helpers } from "../helpers"

const config = {
  defaultLocale: "en" as const,
  fallbackLocale: "en" as const,
  prefixDefaultLocale: true,
  adapter: "react-router" as const,
  regions: {
    en: ["US"],
    es: ["AR"],
  },
}

describe("getLocalePath", () => {
  it("prefixes locale for non-default locale", () => {
    expect(helpers.getLocalePath("/about", "es", config)).toBe("/es/about")
  })

  it("does not prefix default locale if prefixDefaultLocale is false", () => {
    const cfg = { ...config, prefixDefaultLocale: false }
    expect(helpers.getLocalePath("/about", "en", cfg)).toBe("/about")
  })

  it("prefixes default locale if prefixDefaultLocale is true", () => {
    expect(helpers.getLocalePath("/about", "en", config)).toBe("/en/about")
  })

  it("handles root path correctly", () => {
    expect(helpers.getLocalePath("/", "es", config)).toBe("/es")
    expect(helpers.getLocalePath("/", "en", config)).toBe("/en")
  })

  it("adds leading slash if missing", () => {
    expect(helpers.getLocalePath("about", "es", config)).toBe("/es/about")
  })

  it("does not double-prefix if already present", () => {
    expect(helpers.getLocalePath("/es/about", "es", config)).toBe("/es/about")
    expect(helpers.getLocalePath("/en/about", "en", config)).toBe("/en/about")
  })

  it("handles multiple slashes and empty path", () => {
    expect(helpers.getLocalePath("//about///", "es", config)).toBe("/es/about")
    expect(helpers.getLocalePath("", "es", config)).toBe("/es")
  })

  it("handles query params in path", () => {
    expect(helpers.getLocalePath("/about?foo=bar", "es", config)).toBe("/es/about?foo=bar")
  })
})

describe("generateStaticLocalePaths", () => {
  const supportedLocales = ["en", "es"]

  it("generates all locale-prefixed routes when prefixDefaultLocale is true", () => {
    expect(helpers.generateStaticLocalePaths(["/", "/about"], supportedLocales, config)).toEqual([
      "/en",
      "/es",
      "/en/about",
      "/es/about",
    ])
  })

  it("generates correct routes when prefixDefaultLocale is false", () => {
    const cfg = { ...config, prefixDefaultLocale: false }
    expect(helpers.generateStaticLocalePaths(["/", "/about"], supportedLocales, cfg)).toEqual([
      "/",
      "/es",
      "/about",
      "/es/about",
    ])
  })

  it("handles single route", () => {
    expect(helpers.generateStaticLocalePaths(["/profile"], supportedLocales, config)).toEqual([
      "/en/profile",
      "/es/profile",
    ])
  })

  it("handles only default locale", () => {
    expect(helpers.generateStaticLocalePaths(["/"], ["en"], config)).toEqual(["/en"])
  })
})
