import type { LinkProps } from "@tanstack/react-router";

import {
  CreateI18n,
  LocalesObject,
  Adapter,
  PARAM_NAME,
  helpers,
  createI18n as createI18nCore,
} from "@intlize/core";

import {
  useRouterState,
  useParams,
  useSearch,
  useNavigate,
  redirect as routerRedirect,
  Link as LinkTanstackRouter,
} from "@tanstack/react-router";

export const createTanstackRouterAdapter = <Locales extends LocalesObject>(
  config: CreateI18n.Config<Locales>
): Adapter<LinkProps> => {
  const useCurrentLocale = () => {
    const params = useParams({ strict: false });
    const param = params[config.paramName ?? PARAM_NAME];

    if (Array.isArray(param)) return config.defaultLocale.toString();
    return param ?? config.defaultLocale.toString();
  };

  const useNavigateTo = () => {
    const navigate = useNavigate();
    return (to: string) => navigate({ to });
  };

  const usePathname = () => {
    const routerState = useRouterState();
    return routerState.location.pathname;
  };

  const useSearchParams = () => {
    const search = useSearch({ strict: false });
    return search;
  };

  return {
    useCurrentLocale,
    useNavigate: useNavigateTo,
    usePathname,
    useSearchParams,
    redirect: (to, options) => routerRedirect({ to, ...options }),
    Link: (props) => {
      const { to, ...rest } = props;
      const locale = useCurrentLocale();

      return (
        <LinkTanstackRouter
          to={helpers.getLocalePath(to, locale, config)}
          {...rest}
        />
      );
    },
  };
};

export function createI18n<Locales extends LocalesObject>(
  locales: Locales,
  config: CreateI18n.Config<Locales>
) {
  const adapter = createTanstackRouterAdapter(config);
  return createI18nCore(locales, config, adapter);
}
