import { useEffect, useState } from 'react';
import type { Route } from './router';
import { metaForRoute } from './meta';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia(query).matches
      : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function setMetaName(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setMetaProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function useDocumentMeta(route: Route) {
  useEffect(() => {
    const meta = metaForRoute(route);
    document.title = meta.title;
    setMetaName('description', meta.description);
    setMetaProperty('og:title', meta.title);
    setMetaProperty('og:description', meta.description);
    document.documentElement.dataset.route = route.kind === 'project' ? `project:${route.slug}` : route.kind;
  }, [route]);
}
