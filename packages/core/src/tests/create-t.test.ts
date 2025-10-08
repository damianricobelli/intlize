import { describe, expect, it } from "vitest"
import { createT } from "../create-t"

const en = {
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
}

describe("createT", () => {
  // @ts-ignore - test helper, ignore key type
  const t = (key: any, params?: any, scope?: any) => createT("en", en, scope, key, params)

  it("basic interpolation of variables", () => {
    expect(t("greeting", { name: "Chris", count: 2, item: "apples" })).toBe(
      "Hello, Chris! You have 2 apples.",
    )
  })

  it("handles pluralization verifying the correct plural form is selected based on the count", () => {
    expect(t("item", { count: 0 })).toBe("no items")
    expect(t("item", { count: 1 })).toBe("1 item")
    expect(t("item", { count: 2 })).toBe("2 items")
    expect(t("item", { count: 3 })).toBe("3 items")
    expect(t("item", { count: 10 })).toBe("10 items")
    expect(t("item", { count: 99 })).toBe("99 items")
  })

  it("supports nested keys", () => {
    expect(t("nested.hello", { who: "Chris" })).toBe("Hi Chris")
  })

  it("returns key if not found", () => {
    expect(t("notfound")).toBe("notfound")
  })

  it("handles pluralization with scope", () => {
    expect(t("scope.thing", { count: 1 })).toBe("scoped thing")
    expect(t("scope.thing", { count: 3 })).toBe("scoped things")
  })

  it("interpolates multiple variables", () => {
    expect(t("multi.vars", { a: "A", b: "B", c: "C" })).toBe("A, B and C")
  })

  it("falls back to 'other' plural form if specific not found", () => {
    expect(t("fallback", { count: 99 })).toBe("fallback plural other")
  })

  it("returns variable key as a string if no params provided", () => {
    expect(t("item#one")).toBe("{count} item")
  })

  it("interpolates React elements as variables", () => {
    const React = require("react")
    const { createElement } = React
    const bold = (txt: string) => createElement("b", {}, txt)
    const result = t("greeting", { name: bold("Chris"), count: 2, item: "apples" })
    expect(Array.isArray(result)).toBe(true)
    if (Array.isArray(result)) {
      expect(result.some((el: any) => el && el.type === "b")).toBe(true)
    }
  })
})
