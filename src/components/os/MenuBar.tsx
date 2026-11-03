import { BatteryMedium, ChevronRight, Search, Wifi } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { featuredProjects } from '../../content/projects';
import { profile } from '../../content/profile';
import { AppLink, useNavigation } from '../../lib/navigation';
import { OsMark } from './parts';

interface MenuItem {
  label: string;
  href?: string;
  external?: boolean;
  action?: () => void;
  separator?: boolean;
}

interface Menu {
  label: string;
  items: MenuItem[];
}

export function MenuBar({
  onMinimizeAll,
  onRestoreAll,
}: {
  onMinimizeAll: () => void;
  onRestoreAll: () => void;
}) {
  const { navigate } = useNavigation();
  const [open, setOpen] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const focusSearch = () => {
    navigate('/projects/');
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>('#project-search')?.focus();
    }, 60);
  };

  const menus: Menu[] = [
    {
      label: 'ArjunOS',
      items: [
        { label: 'About this portfolio', href: '/about/' },
        { label: 'Walkthrough', href: '/walkthrough/' },
        { label: 'Recruiter Mode', href: '/recruiter/' },
        { label: 'separator', separator: true },
        { label: 'GitHub profile', href: profile.github, external: true },
        { label: 'Source register', href: '/about/' },
      ],
    },
    {
      label: 'File',
      items: [
        { label: 'Résumé (print / PDF)', href: '/resume/' },
        { label: 'Contact routes', href: '/contact/' },
        { label: 'separator', separator: true },
        { label: 'Content Studio (local)', href: '/content-studio/' },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Search projects', action: focusSearch },
        { label: 'Browse all projects', href: '/projects/' },
        { label: 'View skills index', href: '/skills/' },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Home', href: '/' },
        { label: 'Recruiter Mode', href: '/recruiter/' },
        { label: 'Salesforce Workspace', href: '/salesforce/' },
        { label: 'AI Engineering', href: '/ai/' },
        { label: 'Experience', href: '/experience/' },
      ],
    },
    {
      label: 'Projects',
      items: featuredProjects.map((project) => ({
        label: project.name,
        href: `/projects/${project.slug}/`,
      })),
    },
    {
      label: 'Window',
      items: [
        { label: 'Minimize all windows', action: onMinimizeAll },
        { label: 'Restore all windows', action: onRestoreAll },
        { label: 'separator', separator: true },
        { label: 'Back to Home', href: '/' },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'How this was built', href: '/about/' },
        { label: 'Read the résumé', href: '/resume/' },
        { label: 'GitHub ↗', href: profile.github, external: true },
      ],
    },
  ];

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === 'ArrowDown'
        ? items[(index + 1 + items.length) % items.length]
        : items[(index - 1 + items.length) % items.length];
    next?.focus();
  };

  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(now);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(now);

  return (
    <header className="os-menubar" ref={barRef}>
      <div className="os-menubar__left">
        <AppLink href="/" className="os-menubar__brand">
          <OsMark size="sm" />
          <span>ArjunOS</span>
        </AppLink>

        <nav className="os-menubar__menus" aria-label="Desktop menu">
          {menus.map((menu) => {
            const openMenu = open === menu.label;
            return (
              <div className="os-menu" key={menu.label}>
                <button
                  type="button"
                  className={`os-menu__button${openMenu ? ' is-open' : ''}`}
                  aria-expanded={openMenu}
                  aria-haspopup="menu"
                  onClick={() => setOpen(openMenu ? null : menu.label)}
                >
                  {menu.label}
                </button>
                {openMenu ? (
                  <div
                    className="os-menu__panel"
                    role="menu"
                    aria-label={menu.label}
                    onKeyDown={onMenuKeyDown}
                  >
                    {menu.items.map((item) =>
                      item.separator ? (
                        <span className="os-menu__separator" key={`${menu.label}-sep`} role="separator" />
                      ) : item.href ? (
                        <AppLink
                          key={item.label}
                          href={item.href}
                          role="menuitem"
                          className="os-menu__item"
                          {...(item.external
                            ? { target: '_blank', rel: 'noreferrer noopener' }
                            : {})}
                          onClick={() => setOpen(null)}
                        >
                          {item.label}
                          {item.external ? (
                            <ChevronRight size={12} aria-hidden="true" />
                          ) : null}
                        </AppLink>
                      ) : (
                        <button
                          type="button"
                          role="menuitem"
                          className="os-menu__item"
                          key={item.label}
                          onClick={() => {
                            item.action?.();
                            setOpen(null);
                          }}
                        >
                          {item.label}
                        </button>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="os-menubar__status">
        <span className="os-menubar__icon" aria-hidden="true">
          <Wifi size={15} strokeWidth={1.9} />
        </span>
        <button
          type="button"
          className="os-menubar__icon"
          aria-label="Search projects"
          title="Search projects"
          onClick={focusSearch}
        >
          <Search size={15} strokeWidth={1.9} aria-hidden="true" />
        </button>
        <span className="os-menubar__icon" aria-hidden="true">
          <BatteryMedium size={17} strokeWidth={1.8} />
        </span>
        <span className="os-menubar__clock">
          {date} <span aria-hidden="true">·</span> {time}
        </span>
      </div>
    </header>
  );
}
