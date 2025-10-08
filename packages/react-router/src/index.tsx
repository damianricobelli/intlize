import type { LinkProps, To } from "react-router";

import {
  CreateI18n,
  LocalesObject,
  Adapter,
  PARAM_NAME,
  helpers,
  createI18n as createI18nCore,
} from "@intlize/core";

import {
  redirect as redirectReactRouter,
  useLocation,
  useNavigate as useNavigateReactRouter,
  useParams,
  useSearchParams as useSearchParamsReactRouter,
  Link as LinkReactRouter,
} from "react-router";

export const createReactRouterAdapter = <Locales extends LocalesObject>(
  config: CreateI18n.Config<Locales>
): Adapter<LinkProps> => {
  const useCurrentLocale = () => {
    const params = useParams();
    return (
      params[config.paramName ?? PARAM_NAME] ?? config.defaultLocale.toString()
    );
  };

  const useNavigate = () => {
    const navigate = useNavigateReactRouter();
    return (to: string) => navigate(to);
  };

  const usePathname = () => useLocation().pathname;

  const useSearchParams = () => {
    const [searchParams] = useSearchParamsReactRouter();
    return searchParams;
  };

  return {
    useCurrentLocale,
    useNavigate,
    usePathname,
    useSearchParams,
    redirect: (to, options) => redirectReactRouter(to, options),
    Link: (props) => {
      const { to, ...rest } = props;
      const locale = useCurrentLocale();
      let localizedTo: To;

      if (typeof to === "string") {
        localizedTo = helpers.getLocalePath(to, locale, config);
      } else {
        localizedTo = {
          ...to,
          pathname: helpers.getLocalePath(to.pathname ?? "/", locale, config),
        };
      }

      return <LinkReactRouter to={localizedTo} {...rest} />;
    },
  };
};

export function createI18n<Locales extends LocalesObject>(
  locales: Locales,
  config: CreateI18n.Config<Locales>
) {
  const adapter = createReactRouterAdapter(config);
  return createI18nCore(locales, config, adapter);
}
