import { ArrowUpRight, Github } from 'lucide-react';
import { profile } from '../content/profile';
import { AppLink, useNavigation } from '../lib/navigation';
import { LogoMark } from './Logo';

const menuItems = [
  { href: '/', label: 'Projects', key: 'projects' },
  { href: '/resume/', label: 'Résumé', key: 'resume' },
  { href: '/skills/', label: 'Skills', key: 'skills' },
  { href: '/about/', label: 'About', key: 'about' },
  { href: '/contact/', label: 'Contact', key: 'contact' },
] as const;

export function MenuBar() {
  const { route } = useNavigation();
  const active =
    route.kind === 'home' || route.kind === 'project'
      ? 'projects'
      : route.kind === 'app'
        ? route.app
        : '';

  return (
    <header className="menubar">
      <div className="menubar__brand-group">
        <AppLink href="/" className="menubar__brand" aria-label="ArjunOS home">
          <LogoMark />
          <span>ArjunOS</span>
        </AppLink>
        <span className="menubar__edition">Portfolio 2026</span>
      </div>

      <nav className="menubar__nav" aria-label="Primary">
        {menuItems.map((item) => (
          <AppLink
            key={item.key}
            href={item.href}
            className="menubar__link"
            aria-current={active === item.key ? 'page' : undefined}
          >
            {item.label}
          </AppLink>
        ))}
      </nav>

      <div className="menubar__actions">
        <span className="menubar__source">Sources reviewed 1 Nov 2026</span>
        <a
          className="menubar__github"
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Github size={15} aria-hidden="true" />
          <span>GitHub</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
