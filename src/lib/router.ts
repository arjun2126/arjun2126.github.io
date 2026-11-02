export type AppRoute =
  | 'projects'
  | 'recruiter'
  | 'salesforce'
  | 'ai'
  | 'experience'
  | 'live'
  | 'resume'
  | 'skills'
  | 'about'
  | 'contact'
  | 'content';

export type Route =
  | { kind: 'home'; path: '/' }
  | { kind: 'project'; path: string; slug: string }
  | { kind: 'app'; path: string; app: AppRoute }
  | { kind: 'notfound'; path: string };

const appPaths: Record<AppRoute, string> = {
  projects: '/projects/',
  recruiter: '/recruiter/',
  salesforce: '/salesforce/',
  ai: '/ai/',
  experience: '/experience/',
  live: '/northgate-live/',
  resume: '/resume/',
  skills: '/skills/',
  about: '/about/',
  contact: '/contact/',
  content: '/content-studio/',
};

export const appTitles: Record<AppRoute, string> = {
  projects: 'Projects',
  recruiter: 'Recruiter Mode',
  salesforce: 'Salesforce Workspace',
  ai: 'AI Engineering',
  experience: 'Experience',
  live: 'Northgate Live',
  resume: 'Résumé',
  skills: 'Skills',
  about: 'About',
  contact: 'Contact',
  content: 'Content Studio',
};

export function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0].split('#')[0];
  if (withoutQuery === '/') return '/';
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return `${trimmed}/`;
}

export function parseRoute(pathname: string, knownSlugs: ReadonlySet<string>): Route {
  const path = normalizePath(pathname);
  if (path === '/') return { kind: 'home', path: '/' };

  const projectMatch = path.match(/^\/projects\/([^/]+)\/$/);
  if (projectMatch) {
    const slug = decodeURIComponent(projectMatch[1]);
    if (knownSlugs.has(slug)) return { kind: 'project', path, slug };
    return { kind: 'notfound', path };
  }

  for (const [app, appPath] of Object.entries(appPaths) as Array<[AppRoute, string]>) {
    if (path === appPath) return { kind: 'app', path, app };
  }

  return { kind: 'notfound', path };
}

export function routeForApp(app: AppRoute): string {
  return appPaths[app];
}

export function appForRoute(route: Route): AppRoute | undefined {
  return route.kind === 'app' ? route.app : undefined;
}
