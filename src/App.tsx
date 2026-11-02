import { useEffect, useState } from 'react';
import { projectBySlug } from './content/projects';
import { DesktopExperience } from './components/DesktopExperience';
import { MobileExperience } from './components/MobileExperience';
import { RecruiterStandalone } from './components/os/RecruiterView';
import { useDocumentMeta, useMediaQuery } from './lib/hooks';
import { metaForRoute } from './lib/meta';
import { NavigationProvider } from './lib/navigation';
import { parseRoute, type Route } from './lib/router';

const knownSlugs = new Set(Object.keys(projectBySlug));

export default function App() {
  const [route, setRoute] = useState<Route>(() =>
    parseRoute(typeof window === 'undefined' ? '/' : window.location.pathname, knownSlugs),
  );
  const mobile = useMediaQuery('(max-width: 900px)');
  useDocumentMeta(route);

  useEffect(() => {
    document.body.dataset.surface =
      route.kind === 'app' && route.app === 'recruiter' ? 'standalone' : mobile ? 'mobile' : 'desktop';
    return () => {
      delete document.body.dataset.surface;
    };
  }, [mobile, route]);

  const standaloneRecruiter = route.kind === 'app' && route.app === 'recruiter';

  return (
    <NavigationProvider route={route} setRoute={setRoute}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {standaloneRecruiter ? (
        <RecruiterStandalone />
      ) : mobile ? (
        <MobileExperience route={route} />
      ) : (
        <DesktopExperience route={route} />
      )}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {metaForRoute(route).title}
      </div>
    </NavigationProvider>
  );
}
