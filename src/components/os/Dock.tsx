import {
  Briefcase,
  Cloud,
  FileText,
  FolderOpen,
  Github,
  IdCard,
  PenTool,
  Shapes,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { AppRoute, Route } from '../../lib/router';
import { isLocalEnvironment } from '../../lib/local';
import type { WindowState } from '../../lib/windows';
import { profile } from '../../content/profile';

interface DockItem {
  app: AppRoute;
  label: string;
  icon: LucideIcon;
  tone: string;
}

const items: DockItem[] = [
  { app: 'projects', label: 'Projects', icon: FolderOpen, tone: 'blue' },
  { app: 'salesforce', label: 'Salesforce Workspace', icon: Cloud, tone: 'sky' },
  { app: 'recruiter', label: 'Recruiter Mode', icon: IdCard, tone: 'violet' },
  { app: 'ai', label: 'AI Engineering', icon: Sparkles, tone: 'magenta' },
  { app: 'experience', label: 'Experience', icon: Briefcase, tone: 'indigo' },
  { app: 'skills', label: 'Skills', icon: Shapes, tone: 'orange' },
  { app: 'resume', label: 'Résumé', icon: FileText, tone: 'graphite' },
  { app: 'about', label: 'About', icon: UserRound, tone: 'rose' },
  { app: 'content', label: 'Content Studio', icon: PenTool, tone: 'teal' },
];

function isCurrent(route: Route, app: AppRoute): boolean {
  if (route.kind === 'home' || route.kind === 'project') return app === 'projects';
  return route.kind === 'app' && route.app === app;
}

export function Dock({
  windows,
  route,
  onOpen,
}: {
  windows: WindowState[];
  route: Route;
  onOpen: (app: AppRoute) => void;
}) {
  const local = isLocalEnvironment();
  const visible = items.filter((item) => item.app !== 'content' || local);

  return (
    <nav className="os-dock" aria-label="Application dock">
      <div className="os-dock__inner">
        {visible.map((item) => {
          const Icon = item.icon;
          const win = windows.find((entry) => entry.id === item.app);
          const current = isCurrent(route, item.app);
          const minimized = win?.minimized ?? false;
          return (
            <button
              type="button"
              key={item.app}
              className={`os-dock__app${current ? ' is-current' : ''}${win ? ' is-open' : ''}${
                minimized ? ' is-minimized' : ''
              }`}
              onClick={() => onOpen(item.app)}
              aria-current={current ? 'page' : undefined}
              aria-label={`${item.label}${minimized ? ' (minimized)' : ''}`}
            >
              <span className={`os-dock__icon os-dock__icon--${item.tone}`}>
                <Icon size={24} strokeWidth={1.65} aria-hidden="true" />
              </span>
              <span className="os-dock__tooltip" role="tooltip">
                {item.label}
              </span>
              <span className="os-dock__indicator" aria-hidden="true" />
            </button>
          );
        })}

        <span className="os-dock__divider" aria-hidden="true" />

        <a
          className="os-dock__app os-dock__app--external"
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Open Arjun Subramanya’s GitHub profile in a new tab"
        >
          <span className="os-dock__icon os-dock__icon--github">
            <Github size={23} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <span className="os-dock__tooltip" role="tooltip">
            GitHub ↗
          </span>
        </a>
      </div>
    </nav>
  );
}
