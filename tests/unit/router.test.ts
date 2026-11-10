import { describe, expect, it } from 'vitest';
import { normalizePath, parseRoute, routeForApp, type AppRoute } from '../../src/lib/router';
import { projects } from '../../src/content/projects';

const slugs = new Set(projects.map((project) => project.slug));

const apps: AppRoute[] = [
  'projects',
  'recruiter',
  'salesforce',
  'ai',
  'experience',
  'certifications',
  'live',
  'resume',
  'skills',
  'about',
  'contact',
  'content',
];

describe('router', () => {
  it('normalizes root and trailing slashes', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('')).toBe('/');
    expect(normalizePath('/resume')).toBe('/resume/');
    expect(normalizePath('/resume/?x=1#top')).toBe('/resume/');
    expect(normalizePath('/projects/northgate-motors///')).toBe('/projects/northgate-motors/');
  });

  it('parses the home route', () => {
    expect(parseRoute('/', slugs)).toEqual({ kind: 'home', path: '/' });
  });

  it('parses every known project route', () => {
    for (const project of projects) {
      expect(parseRoute(`/projects/${project.slug}/`, slugs)).toEqual({
        kind: 'project',
        path: `/projects/${project.slug}/`,
        slug: project.slug,
      });
    }
  });

  it('parses every app route, including the standalone recruiter view', () => {
    for (const app of apps) {
      const path = routeForApp(app);
      expect(parseRoute(path, slugs)).toEqual({ kind: 'app', path, app });
    }
    expect(routeForApp('recruiter')).toBe('/recruiter/');
    expect(routeForApp('live')).toBe('/northgate-live/');
    expect(routeForApp('content')).toBe('/content-studio/');
  });

  it('marks unknown project slugs and paths as not found', () => {
    expect(parseRoute('/projects/not-real/', slugs).kind).toBe('notfound');
    expect(parseRoute('/nope/', slugs).kind).toBe('notfound');
    expect(parseRoute('/projects/northgate-motors/extra/', slugs).kind).toBe('notfound');
  });
});
