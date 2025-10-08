// See: https://github.com/QuiiBz/next-international/blob/v2/packages/next-international/src/app/app/utils.ts

import type { ReactNode } from "react"

import { cloneElement, isValidElement } from "react"

// Cache structure to store flattened locale content and plural keys
type Cache = {
  content: LocaleType
  pluralKeys: Set<string>
}

// Global cache to avoid re-processing locales
const LOCALE_CACHE = new Map<string, Cache>()

/**
 * Creates a translation function that handles:
 * - Pluralization based on count
 * - Scoped translations (namespace support)
 * - Variable interpolation
 * - React element interpolation
 */
export function createT<
  Locale extends LocaleType,
  Scope extends Scopes<Locale> | undefined,
  Key extends Keys<Locale, Scope>,
  Param extends Params<Locale, Scope, Key>,
>(locale: string, data: Locale, scope: Scope, key: Key, ...params: Param) {
  // Get or create cache for this locale
  let cache = LOCALE_CACHE.get(locale)

  if (!cache) {
    // Find all keys that have plural forms (contain #)
    const pluralKeys = new Set(
      Object.keys(data)
        .filter((key) => key.includes("#"))
        .map((key) => key.split("#", 1)[0]),
    )

    const newCache = {
      content: data,
      pluralKeys,
    }

    cache = newCache
    LOCALE_CACHE.set(locale, newCache)
  }

  const { content, pluralKeys } = cache
  // Create plural rules for the specific locale
  const pluralRules = new Intl.PluralRules(locale)

  // Get the correct plural form based on count
  function getPluralKey(count: number) {
    if (count === 0) return "zero"
    return pluralRules.select(count)
  }

  const paramObject = params[0]
  let isPlural = false

  // Handle pluralization if count parameter exists
  if (paramObject && "count" in paramObject) {
    const isPluralKey = scope ? pluralKeys.has(`${scope}.${key}`) : pluralKeys.has(key)

    if (isPluralKey) {
      // Append plural suffix to key (e.g., "items#one", "items#other")
      key = `${key}#${getPluralKey(paramObject.count)}` as Key
      isPlural = true
    }
  }

  // Get translation value, falling back to key if not found
  let value = scope ? content[`${scope}.${key}`] : content[key]

  if (!value && isPlural) {
    // Fallback to "other" plural form if specific form not found
    const baseKey = key.split("#", 1)[0] as Key
    value = (content[`${baseKey}#other`] || key)?.toString()
  } else {
    value = (value || key)?.toString()
  }

  // Return early if no parameters to interpolate
  if (!paramObject) {
    return value
  }

  let isString = true

  // Split translation by variable placeholders and interpolate values
  const result = value?.split(/({[^}]*})/).map((part, index) => {
    const match = part.match(/{(.*)}/)

    if (match) {
      const param = match[1] as keyof Locale
      // @ts-expect-error - no types
      const paramValue = paramObject[param]

      // Handle React elements specially
      if (isValidElement(paramValue)) {
        isString = false
        return cloneElement(paramValue, { key: `${String(param)}-${index}` })
      }

      return paramValue as ReactNode
    }

    // Return literal text between variables
    return part
  })

  // Join array if all parts are strings, otherwise return array for React
  return isString ? result?.join("") : result
}

// See: https://github.com/QuiiBz/next-international/blob/v2/packages/international-types/index.ts

export type Param = ReactNode
export type LocaleType = Record<string, string>
export type LocalesObject = {
  [locale: string]: () => Promise<{ default: LocaleType }>
}

type ExtractScopes<
  Value extends string,
  Prev extends string | undefined = undefined,
> = Value extends `${infer Head}.${infer Tail}`
  ? [
      Prev extends string ? `${Prev}.${Head}` : Head,
      ...ExtractScopes<Tail, Prev extends string ? `${Prev}.${Head}` : Head>,
    ]
  : []

export type Scopes<
  Locale extends LocaleType,
  TheKeys extends string = Extract<keyof Locale, string>,
> = ExtractScopes<TheKeys>[number]

export type Keys<
  Locale extends LocaleType,
  Scope extends Scopes<Locale> | undefined,
  TheKeys extends string = Extract<keyof Locale, string>,
> = Scope extends undefined
  ? RemovePlural<TheKeys>
  : TheKeys extends `${Scope}.${infer Tail}`
    ? RemovePlural<Tail>
    : never

export type ExtractParams<Value extends string> = Value extends ""
  ? []
  : Value extends `${string}{${infer Param}}${infer Tail}`
    ? [Param, ...ExtractParams<Tail>]
    : []

export type PluralSuffix = "zero" | "one" | "two" | "few" | "many" | "other"
export type RemovePlural<Key extends string> = Key extends `${infer Head}#${PluralSuffix}`
  ? Head
  : Key

export type IsPlural<
  Locale extends LocaleType,
  Scope extends Scopes<Locale> | undefined,
  Key extends string,
> = Scope extends undefined
  ? `${Key}#${PluralSuffix}` & keyof Locale extends never
    ? false
    : true
  : `${Scope}.${Key}#${PluralSuffix}` & keyof Locale extends never
    ? false
    : true

export type GetPluralCount = number

export type Params<
  Locale extends LocaleType,
  Scope extends Scopes<Locale> | undefined,
  Key extends Keys<Locale, Scope>,
  Plural extends boolean = IsPlural<Locale, Scope, Key>,
  Value extends string = Scope extends undefined
    ? Plural extends true
      ? Locale[`${Key}#${PluralSuffix}`]
      : Locale[Key]
    : Plural extends true
      ? Locale[`${Scope}.${Key}#${PluralSuffix}`]
      : Locale[`${Scope}.${Key}`],
  TheParams extends string[] = ExtractParams<Value>,
> = Plural extends true
  ? TheParams["length"] extends 0
    ? [{ count: GetPluralCount }]
    : [
        { count: GetPluralCount } & {
          [K in TheParams[number]]: Param
        },
      ]
  : TheParams["length"] extends 0
    ? []
    : [
        {
          [K in TheParams[number]]: Param
        },
      ]

type UnionToIntersection<U> = (U extends never ? never : (arg: U) => never) extends (
  arg: infer I,
) => void
  ? I
  : never

type UnionToTuple<T> =
  UnionToIntersection<T extends never ? never : (t: T) => T> extends (_: never) => infer W
    ? [...UnionToTuple<Exclude<T, W>>, W]
    : []

type SomeKey<T extends Record<string, any>> = UnionToTuple<keyof T>[0] extends string
  ? UnionToTuple<keyof T>[0]
  : never

export type GetLocale<Locales extends LocalesObject> = Awaited<
  ReturnType<Locales[SomeKey<Locales>]>
>["default"]
