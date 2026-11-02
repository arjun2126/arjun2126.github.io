import {
  FileText,
  FolderOpen,
  Github,
  Mail,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { AppRoute, Route } from '../lib/router';
import type { WindowState } from '../lib/windows';
import { profile } from '../content/profile';

type DockApp = 'projects' | AppRoute;

interface DockItem {
  app: DockApp;
  label: string;
  icon: LucideIcon;
  tone: string;
}

const dockItems: DockItem[] = [
  { app: 'projects', label: 'Projects', icon: FolderOpen, tone: 'lime' },
  { app: 'resume', label: 'Résumé', icon: FileText, tone: 'paper' },
  { app: 'skills', label: 'Skills', icon: Sparkles, tone: 'sage' },
  { app: 'about', label: 'About', icon: UserRound, tone: 'clay' },
  { app: 'contact', label: 'Contact', icon: Mail, tone: 'sky' },
];

function isRouteApp(route: Route, app: DockApp): boolean {
  if (app === 'projects') return route.kind === 'home';
  return route.kind === 'app' && route.app === app;
}

export function Dock({
  windows,
  route,
  onOpen,
}: {
  windows: WindowState[];
  route: Route;
  onOpen: (app: DockApp) => void;
}) {
  return (
    <nav className="dock" aria-label="Application dock">
      <div className="dock__inner">
        {dockItems.map((item) => {
          const Icon = item.icon;
          const win = windows.find((entry) => entry.id === item.app);
          const current = isRouteApp(route, item.app);
          const minimized = win?.minimized ?? false;
          return (
            <button
              type="button"
              key={item.app}
              className={`dock__app${current ? ' is-current' : ''}${win ? ' is-open' : ''}${minimized ? ' is-minimized' : ''}`}
              onClick={() => onOpen(item.app)}
              aria-current={current ? 'page' : undefined}
              aria-label={`${item.label}${minimized ? ' (minimized)' : ''}`}
            >
              <span className={`dock__icon dock__icon--${item.tone}`}>
                <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="dock__tooltip" role="tooltip">
                {item.label}
              </span>
              <span className="dock__indicator" aria-hidden="true" />
            </button>
          );
        })}
        <span className="dock__divider" aria-hidden="true" />
        <a
          className="dock__app dock__app--external"
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open Arjun Subramanya’s GitHub profile in a new tab"
        >
          <span className="dock__icon dock__icon--github">
            <Github size={22} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <span className="dock__tooltip" role="tooltip">
            GitHub ↗
          </span>
        </a>
      </div>
    </nav>
  );
}
