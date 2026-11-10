import type { Route } from './router';

export type WindowKind =
  | 'projects'
  | 'recruiter'
  | 'salesforce'
  | 'project'
  | 'resume'
  | 'skills'
  | 'about'
  | 'contact'
  | 'ai'
  | 'experience'
  | 'certifications'
  | 'live'
  | 'walkthrough'
  | 'content'
  | 'notfound';

export type WindowId = WindowKind | `project:${string}`;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: WindowId;
  kind: WindowKind;
  slug?: string;
  rect: Rect;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

export interface Viewport {
  width: number;
  height: number;
}

export const MENU_HEIGHT = 44;
export const DOCK_SPACE = 96;
const STAGE_MARGIN = 48;
const STAGE_TOP = 16;
const STAGE_BOTTOM = 16;
const COLUMN_GAP = 18;
const WINDOW_GAP = 16;
const COMPACT_WIDTH = 1080;

type Variant = 'home' | 'focus';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function stageSize(viewport: Viewport): { width: number; height: number } {
  return {
    width: Math.max(320, viewport.width),
    height: Math.max(360, viewport.height - MENU_HEIGHT - DOCK_SPACE),
  };
}

function isCompact(stage: { width: number }): boolean {
  return stage.width < COMPACT_WIDTH;
}

function rightColumnWidth(stage: { width: number }): number {
  return clamp(stage.width * 0.266, 356, 440);
}

function mainRect(stage: { width: number; height: number }): Rect {
  const width = isCompact(stage)
    ? stage.width - STAGE_MARGIN * 2
    : stage.width - STAGE_MARGIN * 2 - COLUMN_GAP - rightColumnWidth(stage);
  return {
    x: STAGE_MARGIN,
    y: STAGE_TOP,
    width,
    height: stage.height - STAGE_TOP - STAGE_BOTTOM,
  };
}

function rightRect(stage: { width: number; height: number }, variant: Variant): Rect {
  const width = rightColumnWidth(stage);
  const x = mainRect(stage).x + mainRect(stage).width + COLUMN_GAP;
  if (variant === 'home') {
    const recruiterHeight = clamp(stage.height * 0.45, 292, 372);
    return { x, y: STAGE_TOP, width, height: recruiterHeight };
  }
  return { x, y: STAGE_TOP, width, height: stage.height - STAGE_TOP - STAGE_BOTTOM };
}

function focusedRect(
  stage: { width: number; height: number },
  preferredWidth: number,
): Rect {
  const width = clamp(preferredWidth, 320, stage.width - STAGE_MARGIN * 2);
  return {
    x: Math.round((stage.width - width) / 2),
    y: STAGE_TOP,
    width,
    height: stage.height - STAGE_TOP - STAGE_BOTTOM,
  };
}

const docWidths: Partial<Record<WindowKind, number>> = {
  project: 1040,
  resume: 920,
  skills: 960,
  about: 900,
  contact: 780,
  ai: 1000,
  experience: 940,
  certifications: 1040,
  live: 1120,
  content: 1120,
};

export function createWindowRect(
  kind: WindowKind,
  viewport: Viewport,
  variant: Variant = 'focus',
): Rect {
  const stage = stageSize(viewport);

  switch (kind) {
    case 'projects':
      return mainRect(stage);
    case 'recruiter': {
      if (variant === 'home' && !isCompact(stage)) return rightRect(stage, 'home');
      return focusedRect(stage, 860);
    }
    case 'salesforce': {
      if (variant === 'home' && !isCompact(stage)) {
        const recruiter = rightRect(stage, 'home');
        const y = recruiter.y + recruiter.height + WINDOW_GAP;
        return {
          x: recruiter.x,
          y,
          width: recruiter.width,
          height: Math.max(220, stage.height - y - STAGE_BOTTOM),
        };
      }
      {
        const width = clamp(980, 320, stage.width - STAGE_MARGIN * 2);
        const height = Math.min(stage.height - 24, 700);
        return {
          x: Math.round((stage.width - width) / 2),
          y: Math.round((stage.height - height) / 2),
          width,
          height,
        };
      }
    }
    case 'project':
    case 'resume':
    case 'skills':
    case 'about':
    case 'contact':
    case 'ai':
    case 'experience':
    case 'certifications':
    case 'live':
    case 'walkthrough':
    case 'content':
      return focusedRect(stage, docWidths[kind] ?? 900);
    case 'notfound':
      return {
        ...focusedRect(stage, 560),
        height: Math.min(420, stage.height - 24),
      };
  }
}

export function routeWindows(route: Route): Array<{ id: WindowId; kind: WindowKind; slug?: string }> {
  if (route.kind === 'notfound') return [{ id: 'notfound', kind: 'notfound' }];

  const base = [{ id: 'projects' as WindowId, kind: 'projects' as WindowKind }];

  if (route.kind === 'project') {
    return [
      ...base,
      { id: `project:${route.slug}` as WindowId, kind: 'project' as WindowKind, slug: route.slug },
    ];
  }

  if (route.kind === 'app') {
    if (route.app === 'projects') return base;
    if (route.app === 'recruiter' || route.app === 'salesforce') {
      return [...base, { id: route.app, kind: route.app as WindowKind }];
    }
    return [...base, { id: route.app, kind: route.app as WindowKind }];
  }

  return [
    ...base,
    { id: 'recruiter' as WindowId, kind: 'recruiter' as WindowKind },
    { id: 'salesforce' as WindowId, kind: 'salesforce' as WindowKind },
  ];
}

function nextZ(windows: WindowState[]): number {
  return windows.reduce((highest, win) => Math.max(highest, win.z), 0) + 1;
}

function windowRect(
  kind: WindowKind,
  route: Route,
  viewport: Viewport,
): Rect {
  const variant: Variant =
    route.kind === 'home' && (kind === 'recruiter' || kind === 'salesforce') ? 'home' : 'focus';
  return createWindowRect(kind, viewport, variant);
}

export function initialWindows(route: Route, viewport: Viewport): WindowState[] {
  const compact = isCompact(stageSize(viewport));
  return routeWindows(route).map((entry, index) => ({
    ...entry,
    rect: windowRect(entry.kind, route, viewport),
    z: index + 1,
    minimized:
      route.kind === 'home' &&
      compact &&
      (entry.kind === 'recruiter' || entry.kind === 'salesforce'),
    maximized: false,
  }));
}

export function reconcileWindows(
  current: WindowState[],
  route: Route,
  viewport: Viewport,
): WindowState[] {
  const desired = routeWindows(route);
  const desiredIds = new Set(desired.map((entry) => entry.id));
  const retained = current.filter((win) => desiredIds.has(win.id));
  const byId = new Map(retained.map((win) => [win.id, win]));
  const compact = isCompact(stageSize(viewport));
  let z = nextZ(retained);

  const next = desired.map((entry) => {
    const existing = byId.get(entry.id);
    if (existing) return existing;
    return {
      ...entry,
      rect: windowRect(entry.kind, route, viewport),
      z: z++,
      minimized:
        route.kind === 'home' &&
        compact &&
        (entry.kind === 'recruiter' || entry.kind === 'salesforce'),
      maximized: false,
    };
  });

  const primaryId = desired[desired.length - 1]?.id;
  return next.map((win) =>
    win.id === primaryId ? { ...win, minimized: false, z: nextZ(next) } : win,
  );
}

export function resizeWindows(windows: WindowState[], viewport: Viewport): WindowState[] {
  const stage = stageSize(viewport);
  return windows.map((win) => {
    if (win.maximized) return win;
    const homeLayout = windows.some((entry) => entry.kind === 'recruiter');
    if (win.kind === 'projects') {
      return { ...win, rect: createWindowRect('projects', viewport) };
    }
    if (homeLayout && (win.kind === 'recruiter' || win.kind === 'salesforce')) {
      return { ...win, rect: createWindowRect(win.kind, viewport, 'home') };
    }
    const width = Math.min(win.rect.width, Math.max(320, stage.width - STAGE_MARGIN * 2));
    const height = Math.min(win.rect.height, Math.max(320, stage.height - 12));
    const x = clamp(win.rect.x, 0, Math.max(0, stage.width - width));
    const y = clamp(win.rect.y, 0, Math.max(0, stage.height - height));
    return { ...win, rect: { x, y, width, height } };
  });
}

export function focusWindow(windows: WindowState[], id: WindowId): WindowState[] {
  if (!windows.some((win) => win.id === id)) return windows;
  const z = nextZ(windows);
  return windows.map((win) => (win.id === id ? { ...win, z } : win));
}

export function closeWindow(windows: WindowState[], id: WindowId): WindowState[] {
  return windows.filter((win) => win.id !== id);
}

export function minimizeWindow(windows: WindowState[], id: WindowId): WindowState[] {
  return windows.map((win) => (win.id === id ? { ...win, minimized: true, maximized: false } : win));
}

export function restoreWindow(windows: WindowState[], id: WindowId): WindowState[] {
  const z = nextZ(windows);
  return windows.map((win) => (win.id === id ? { ...win, minimized: false, z } : win));
}

export function toggleMaximize(windows: WindowState[], id: WindowId): WindowState[] {
  const z = nextZ(windows);
  return windows.map((win) =>
    win.id === id ? { ...win, maximized: !win.maximized, minimized: false, z } : win,
  );
}

export function moveWindow(windows: WindowState[], id: WindowId, rect: Rect): WindowState[] {
  return windows.map((win) => (win.id === id ? { ...win, rect } : win));
}

export function topWindow(windows: WindowState[]): WindowState | undefined {
  return [...windows].filter((win) => !win.minimized).sort((a, b) => b.z - a.z)[0];
}

export function isWindowOpen(windows: WindowState[], id: WindowId): boolean {
  return windows.some((win) => win.id === id);
}
