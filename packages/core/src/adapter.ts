export type Adapter<LinkComponentProps> = {
  useCurrentLocale: () => string;
  useNavigate: () => (to: string) => void;
  usePathname: () => string;
  useSearchParams: () => URLSearchParams;
  redirect: (to: string, options: { headers: Headers }) => Response;
  Link: (props: LinkComponentProps) => React.ReactNode;
};