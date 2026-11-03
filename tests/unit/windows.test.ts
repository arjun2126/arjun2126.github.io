import { describe, expect, it } from 'vitest';
import {
  closeWindow,
  createWindowRect,
  focusWindow,
  initialWindows,
  minimizeWindow,
  moveWindow,
  reconcileWindows,
  resizeWindows,
  restoreWindow,
  routeWindows,
  toggleMaximize,
  topWindow,
  type Viewport,
  type WindowKind,
} from '../../src/lib/windows';
import type { Route } from '../../src/lib/router';

const viewport: Viewport = { width: 1440, height: 900 };
const home: Route = { kind: 'home', path: '/' };
const project: Route = { kind: 'project', path: '/projects/northgate-motors/', slug: 'northgate-motors' };
const resume: Route = { kind: 'app', app: 'resume', path: '/resume/' };
const salesforce: Route = { kind: 'app', app: 'salesforce', path: '/salesforce/' };

const kinds: WindowKind[] = [
  'projects',
  'recruiter',
  'salesforce',
  'project',
  'resume',
  'skills',
  'about',
  'contact',
  'ai',
  'experience',
  'live',
  'content',
  'notfound',
];

describe('window manager', () => {
  it('composes the reference desktop at home: main, recruiter and Salesforce windows', () => {
    const windows = initialWindows(home, viewport);
    expect(windows.map((win) => win.id)).toEqual(['projects', 'recruiter', 'salesforce']);
    expect(windows.every((win) => !win.minimized && !win.maximized)).toBe(true);
    expect(topWindow(windows)?.id).toBe('salesforce');

    const main = windows[0].rect;
    const recruiter = windows[1].rect;
    const salesforceRect = windows[2].rect;
    expect(main.x).toBeLessThan(recruiter.x);
    expect(recruiter.y).toBeLessThan(salesforceRect.y);
    expect(main.height).toBeGreaterThan(recruiter.height);
  });

  it('starts the right-column windows minimized on compact desktops', () => {
    const windows = initialWindows(home, { width: 1024, height: 800 });
    expect(windows).toHaveLength(3);
    expect(windows.find((win) => win.id === 'recruiter')?.minimized).toBe(true);
    expect(windows.find((win) => win.id === 'salesforce')?.minimized).toBe(true);
    expect(topWindow(windows)?.id).toBe('projects');
  });

  it('opens the project window above the main window on direct project routes', () => {
    const windows = initialWindows(project, viewport);
    expect(windows.map((win) => win.id)).toEqual(['projects', 'project:northgate-motors']);
    expect(topWindow(windows)?.id).toBe('project:northgate-motors');
    expect(windows[0].z).toBeLessThan(windows[1].z);
  });

  it('opens app windows above the main window and closes stale windows', () => {
    const windows = initialWindows(project, viewport);
    const next = reconcileWindows(windows, resume, viewport);
    expect(next.map((win) => win.id)).toEqual(['projects', 'resume']);
    expect(topWindow(next)?.id).toBe('resume');
    expect(next.some((win) => win.id === 'project:northgate-motors')).toBe(false);
  });

  it('gives direct Salesforce visits a focused window rather than the home column', () => {
    const windows = initialWindows(salesforce, viewport);
    expect(windows.map((win) => win.id)).toEqual(['projects', 'salesforce']);
    const win = windows[1];
    expect(win.minimized).toBe(false);
    expect(win.rect.width).toBeGreaterThan(windows[0].rect.width * 0.8);
  });

  it('retains the main window rect when adding an app', () => {
    const windows = initialWindows(home, viewport);
    const rect = windows[0].rect;
    const next = reconcileWindows(windows, resume, viewport);
    expect(next[0].rect).toEqual(rect);
  });

  it('focuses a window by raising its z-index', () => {
    const windows = initialWindows(home, viewport);
    const next = focusWindow(windows, 'projects');
    expect(topWindow(next)?.id).toBe('projects');
  });

  it('minimizes and restores without losing route state', () => {
    let windows = initialWindows(home, viewport);
    windows = minimizeWindow(windows, 'recruiter');
    expect(windows.find((win) => win.id === 'recruiter')?.minimized).toBe(true);
    windows = restoreWindow(windows, 'recruiter');
    expect(windows.find((win) => win.id === 'recruiter')?.minimized).toBe(false);
    expect(topWindow(windows)?.id).toBe('recruiter');
  });

  it('toggles maximize while preserving the restore rect', () => {
    let windows = initialWindows(home, viewport);
    const rect = windows[0].rect;
    windows = toggleMaximize(windows, 'projects');
    expect(windows[0].maximized).toBe(true);
    expect(windows[0].rect).toEqual(rect);
    windows = toggleMaximize(windows, 'projects');
    expect(windows[0].maximized).toBe(false);
    expect(windows[0].rect).toEqual(rect);
  });

  it('closes windows', () => {
    const windows = initialWindows(project, viewport);
    expect(closeWindow(windows, 'project:northgate-motors')).toHaveLength(1);
    expect(closeWindow(windows, 'projects')).toHaveLength(1);
  });

  it('fits open windows inside a shrunken viewport', () => {
    const windows = initialWindows(home, viewport);
    const smaller: Viewport = { width: 960, height: 720 };
    const fitted = resizeWindows(windows, smaller);
    for (const win of fitted) {
      expect(win.rect.width).toBeLessThanOrEqual(smaller.width);
      expect(win.rect.x).toBeGreaterThanOrEqual(0);
      expect(win.rect.x + win.rect.width).toBeLessThanOrEqual(smaller.width);
      expect(win.rect.y + win.rect.height).toBeLessThanOrEqual(smaller.height - 44);
    }
  });

  it('moves a window to an exact rect', () => {
    const windows = initialWindows(home, viewport);
    const next = moveWindow(windows, 'projects', { x: 20, y: 40, width: 900, height: 600 });
    expect(next[0].rect).toEqual({ x: 20, y: 40, width: 900, height: 600 });
  });

  it('creates positive, in-stage rectangles for every kind', () => {
    for (const kind of kinds) {
      const rect = createWindowRect(kind, viewport);
      expect(rect.width).toBeGreaterThan(400);
      expect(rect.height).toBeGreaterThan(300);
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height - 44);
    }
  });

  it('describes desired windows for each route', () => {
    expect(routeWindows(home).map((win) => win.id)).toEqual(['projects', 'recruiter', 'salesforce']);
    expect(routeWindows(project).map((win) => win.id)).toEqual(['projects', 'project:northgate-motors']);
    expect(routeWindows(resume).map((win) => win.id)).toEqual(['projects', 'resume']);
    expect(routeWindows(salesforce).map((win) => win.id)).toEqual(['projects', 'salesforce']);
    expect(routeWindows({ kind: 'app', app: 'live', path: '/northgate-live/' }).map((win) => win.id)).toEqual([
      'projects',
      'live',
    ]);
    expect(routeWindows({ kind: 'notfound', path: '/404/' }).map((win) => win.id)).toEqual(['notfound']);
  });
});
