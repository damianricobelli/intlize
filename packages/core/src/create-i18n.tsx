import type {
  GetLocale,
  Keys,
  LocalesObject,
  LocaleType,
  Params,
  Scopes,
} from "./create-t";

import { createI18nClient } from "./create-i18n-client";
import { createI18nServer } from "./create-i18n-server";
import { helpers } from "./helpers";
import { Adapter } from "./adapter";

/**
 * Create a i18n instance for client and server side.
 *
 * @param locales - The locales object.
 * @param config - The i18n config.
 * @returns A i18n instance for client and server side.
 */
export function createI18n<
  LinkComponentProps extends any,
  Locales extends LocalesObject,
  Locale extends LocaleType = GetLocale<Locales>
>(
  locales: Locales,
  config: CreateI18n.Config<Locales>,
  adapter: Adapter<LinkComponentProps>
): CreateI18n.Return<Locales, Locale> {
  helpers.checkLocaleKeys(locales);

  const supportedLocales = Object.keys(locales);

  return {
    i18nClient: createI18nClient(locales, config, adapter),
    i18nServer: createI18nServer(locales, config, adapter),
    supportedLocales,
    getLocalePath: (to, locale) => helpers.getLocalePath(to, locale, config),
    generateStaticLocalePaths: (routes) =>
      helpers.generateStaticLocalePaths(routes, supportedLocales, config),
    getDir: (locale) =>
      helpers.rtlLanguages.has(locale as string) ? "rtl" : "ltr",
  };
}

export namespace CreateI18n {
  export type Get<Locale extends LocaleType> = () => Promise<
    <Key extends Keys<Locale, undefined>>(
      key: Key,
      ...params: Params<Locale, undefined, Key>
    ) => string | React.ReactNode[]
  >;

  export type GetScoped<Locale extends LocaleType> = <
    Scope extends Scopes<Locale>
  >(
    scope: Scope
  ) => Promise<
    <Key extends Keys<Locale, Scope>>(
      key: Key,
      ...params: Params<Locale, Scope, Key>
    ) => string | React.ReactNode[]
  >;

  export type UseLocale<Locales extends LocalesObject> = () => keyof Locales;

  export type UseChangeLocale<Locales extends LocalesObject> = () => (
    locale: keyof Locales
  ) => void;

  export type ClientReturn<
    Locales extends LocalesObject,
    Locale extends LocaleType,
    LinkPropsType = any
  > = {
    /**
     * Get the translation of a key.
     */
    t: Get<Locale>;
    /**
     * Get the translation of a key with a scope.
     */
    scopedT: GetScoped<Locale>;
    /**
     * Get the current locale.
     */
    currentLocale: UseLocale<Locales>;
    /**
     * Get the current region.
     */
    currentRegion: () => `${string}-${string}`;
    /**
     * Hook to change the locale.
     */
    useChangeLocale: UseChangeLocale<Locales>;
    /**
     * Link component with localized path.
     */
    LocaleLink: (props: LinkPropsType) => React.ReactNode;
  };

  export type ServerGet<Locale extends LocaleType> = (
    request: Request
  ) => ReturnType<Get<Locale>>;

  export type ServerGetScoped<Locale extends LocaleType> = (
    scope: Scopes<Locale>,
    request: Request
  ) => ReturnType<Get<Locale>>;

  export type ServerReturn<
    Locales extends LocalesObject,
    Locale extends LocaleType
  > = {
    /**
     * Get the translation of a key.
     */
    t: ServerGet<Locale>;
    /**
     * Get the translation of a key with a scope.
     */
    scopedT: ServerGetScoped<Locale>;
    /**
     * Check if the request should be redirected to a localized URL.
     */
    resolve: (
      request: Request,
      params: Record<string, string | undefined>
    ) => {
      locale: keyof Locales | undefined;
      region: string | undefined;
      fullLocale: string | undefined;
      request: Request;
    };
  };

  export type Return<
    Locales extends LocalesObject,
    Locale extends LocaleType
  > = {
    /**
     * Create a i18n instance for client side.
     *
     * @param locales - The locales object.
     * @param config - The config object.
     * @returns A i18n instance.
     */
    i18nClient: ClientReturn<Locales, Locale>;
    /**
     * Create a i18n instance for server side.
     *
     * @param locales - The locales object.
     * @param config - The i18n config.
     * @returns A i18n instance
     */
    i18nServer: ServerReturn<Locales, Locale>;
    /**
     * Array of supported locales based on the config.
     */
    supportedLocales: Array<keyof Locales>;
    /**
     * Get the locale path for a given route.
     *
     * @param to - The path to build.
     * @param locale - The locale to build the path for.
     * @returns The locale path.
     */
    getLocalePath: (to: string, locale: keyof Locales) => string;
    /**
     * Generate static locale paths for the i18n routes. It's useful for pre-rendering the routes.
     *
     * @param routes - The routes to generate static locale paths for.
     * @returns The static locale paths.
     */
    generateStaticLocalePaths: (routes: Array<string>) => Array<string>;
    /**
     * Get the direction of a locale.
     *
     * @param locale - The locale to get the direction for.
     * @returns The direction of the locale.
     */
    getDir: (locale: keyof Locales) => "ltr" | "rtl";
  };

  export type Config<Locales extends LocalesObject> = {
    /**
     * The default locale to use if no locale is provided.
     */
    defaultLocale: keyof Locales;
    /**
     * The fallback locale to use if the provided locale is not supported.
     */
    fallbackLocale: keyof Locales;
    /**
     * The regions for each locale.
     */
    regions: Record<keyof Locales, Array<string>>;
    /**
     * Displays the default locale in the pathname.
     *
     * For example:
     * - defaultLocale: "en-US"
     * - prefixDefaultLocale: true
     * - pathname: "/en-US/home"
     * - prefixDefaultLocale: false
     * - pathname: "/home"
     *
     * @default true
     */
    prefixDefaultLocale?: boolean;
    /**
     * The name of the React Router param that will be used to determine the locale in a client component.
     *
     * @default locale
     */
    paramName?: string;
  };
}

// This is a workaround to avoid the warning "A component was suspended by an uncached promise"
// when using the i18n client in development mode.
// This is a known issue with React 19 and React Router 7 until they add support for it.
// TODO: Come back here when RR supports RSC
if (process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      message.includes("A component was suspended by an uncached promise")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}
