import {
  CreateI18n,
  LocalesObject,
  Adapter,
  PARAM_NAME,
  helpers,
  createI18n as createI18nCore,
} from "@intlize/core";

import type { Url } from "next/dist/shared/lib/router/router";
import type { LinkProps } from "next/link";

import Link from "next/link";

import {
  usePathname as usePathnameNextjs,
  useRouter,
  useParams,
  useSearchParams as useSearchParamsNextjs,
} from "next/navigation";
import { NextResponse } from "next/server";

const createNextjsAdapter = <Locales extends LocalesObject>(
  config: CreateI18n.Config<Locales>
): Adapter<LinkProps> => {
  const useCurrentLocale = () => {
    const params = useParams();

    const param = params[config.paramName ?? PARAM_NAME];

    if (Array.isArray(param)) {
      return config.defaultLocale.toString();
    }

    return param ?? config.defaultLocale.toString();
  };

  const useNavigate = () => {
    const router = useRouter();
    return (to: string) => router.push(to);
  };

  const usePathname = () => usePathnameNextjs();

  const useSearchParams = () => {
    const searchParams = useSearchParamsNextjs();
    return searchParams;
  };

  return {
    useCurrentLocale,
    useNavigate,
    usePathname,
    useSearchParams,
    redirect: (to, options) => NextResponse.redirect(to, options),
    Link: (props) => {
      const { href, ...rest } = props;
      const locale = useCurrentLocale();

      let localizedHref: Url;

      if (typeof href === "string") {
        localizedHref = helpers.getLocalePath(href, locale, config);
      } else {
        localizedHref = {
          ...href,
          pathname: helpers.getLocalePath(href.pathname ?? "/", locale, config),
        };
      }

      return <Link href={localizedHref} {...rest} />;
    },
  };
};

export function createI18n<Locales extends LocalesObject>(
  locales: Locales,
  config: CreateI18n.Config<Locales>
) {
  const adapter = createNextjsAdapter(config);
  return createI18nCore(locales, config, adapter);
}
