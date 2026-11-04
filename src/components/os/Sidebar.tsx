import {
  Briefcase,
  Cloud,
  FileText,
  FolderOpen,
  Github,
  Home,
  IdCard,
  Linkedin,
  Lock,
  PenTool,
  Shapes,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { profile } from '../../content/profile';
import { featuredProjects, projects } from '../../content/projects';
import type { Route } from '../../lib/router';
import { AppLink, useNavigation } from '../../lib/navigation';
import { isLocalEnvironment } from '../../lib/local';
import { OsMark } from './parts';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  locked?: boolean;
}

const mainNav: NavItem[] = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'recruiter', label: 'Recruiter Mode', href: '/recruiter/', icon: IdCard },
  { key: 'salesforce', label: 'Salesforce Workspace', href: '/salesforce/', icon: Cloud },
  { key: 'projects', label: 'Projects', href: '/projects/', icon: FolderOpen },
  { key: 'ai', label: 'AI Engineering', href: '/ai/', icon: Sparkles },
  { key: 'experience', label: 'Experience', href: '/experience/', icon: Briefcase },
  { key: 'skills', label: 'Skills', href: '/skills/', icon: Shapes },
  { key: 'content', label: 'Content Studio', href: '/content-studio/', icon: PenTool, locked: true },
];

function activeKey(route: Route): string {
  if (route.kind === 'home') return 'home';
  if (route.kind === 'project') return 'projects';
  if (route.kind === 'app') return route.app === 'projects' ? 'projects' : route.app;
  return '';
}

export function Sidebar() {
  const { route } = useNavigation();
  const active = activeKey(route);
  const local = isLocalEnvironment();
  const nav = mainNav.filter((item) => item.key !== 'content' || local);

  return (
    <aside className="os-sidebar">
      <AppLink href="/" className="os-sidebar__brand">
        <OsMark size="md" />
        <span>ArjunOS</span>
      </AppLink>

      <nav className="os-sidebar__nav" aria-label="ArjunOS applications">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <AppLink
              key={item.key}
              href={item.href}
              className={`os-sidebar__link${active === item.key ? ' is-active' : ''}`}
              aria-current={active === item.key ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className="os-sidebar__label">{item.label}</span>
              {item.locked ? (
                <Lock className="os-sidebar__lock" size={13} aria-label="Local only" />
              ) : null}
            </AppLink>
          );
        })}
      </nav>

      <div className="os-sidebar__quick">
        <span className="os-sidebar__heading">Quick links</span>
        <AppLink href="/resume/" className="os-sidebar__quick-link">
          <FileText size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>Résumé</span>
        </AppLink>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
          className="os-sidebar__quick-link"
        >
          <Github size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>GitHub</span>
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer noopener"
          className="os-sidebar__quick-link"
        >
          <Linkedin size={16} strokeWidth={1.7} aria-hidden="true" />
          <span>LinkedIn</span>
        </a>
      </div>

      <div className="os-sidebar__footer">
        <span>
          {projects.length} projects · {featuredProjects.length} featured
        </span>
        <span>Profile reviewed Nov 2026</span>
        <span className="os-sidebar__version">PORTFOLIO V1.1</span>
      </div>
    </aside>
  );
}
