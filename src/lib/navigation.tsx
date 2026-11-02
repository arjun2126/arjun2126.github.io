import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import type { Route } from './router';
import { parseRoute } from './router';
import { projectBySlug } from '../content/projects';

const knownSlugs = new Set(Object.keys(projectBySlug));

interface NavigationValue {
  route: Route;
  navigate: (to: string) => void;
}

const NavigationContext = createContext<NavigationValue | null>(null);

export function NavigationProvider({
  route,
  setRoute,
  children,
}: {
  route: Route;
  setRoute: (route: Route) => void;
  children: ReactNode;
}) {
  const navigate = useCallback(
    (to: string) => {
      const [rawPath, rawHash] = to.split('#');
      const nextRoute = parseRoute(rawPath || '/', knownSlugs);
      if (nextRoute.path !== window.location.pathname) {
        window.history.pushState({}, '', `${nextRoute.path}${rawHash ? `#${rawHash}` : ''}`);
      }
      setRoute(nextRoute);
      if (rawHash) {
        window.setTimeout(() => {
          document.getElementById(rawHash)?.scrollIntoView({ block: 'start' });
        }, 30);
      } else {
        window.setTimeout(() => {
          document.querySelector<HTMLElement>('[data-route-scroll]')?.scrollTo({ top: 0 });
          if (window.matchMedia('(max-width: 900px)').matches) {
            window.scrollTo({ top: 0 });
          }
        }, 0);
      }
    },
    [setRoute],
  );

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname, knownSlugs));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setRoute]);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationValue {
  const value = useContext(NavigationContext);
  if (!value) throw new Error('NavigationProvider is missing');
  return value;
}

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
}

export function AppLink({ href, children, onClick, ...rest }: AppLinkProps) {
  const { navigate } = useNavigation();
  const isExternal = /^(https?:|mailto:)/.test(href);

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (isExternal) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;
        if (rest.target && rest.target !== '_self') return;
        event.preventDefault();
        navigate(href);
      }}
      {...(isExternal ? { rel: rest.rel ?? 'noreferrer noopener' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
