import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  FolderOpen,
  Github,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { featuredProjects, extraProjects, projects } from '../content/projects';
import { profile } from '../content/profile';
import { AppLink, useNavigation } from '../lib/navigation';
import { emptyFilters, hasActiveFilters, searchProjects } from '../lib/search';
import { CompactProjectRow, ProjectCard } from './ProjectCard';
import { ProjectFilterBar } from './ProjectFilterBar';

const navItems = [
  { href: '/', label: 'Projects', icon: FolderOpen, route: 'home' },
  { href: '/resume/', label: 'Résumé', icon: FileText, route: 'resume' },
  { href: '/skills/', label: 'Skills', icon: Sparkles, route: 'skills' },
  { href: '/about/', label: 'About', icon: UserRound, route: 'about' },
  { href: '/contact/', label: 'Contact', icon: Mail, route: 'contact' },
] as const;

function SidebarNav() {
  const { route } = useNavigation();
  const active =
    route.kind === 'home'
      ? 'home'
      : route.kind === 'project'
        ? 'home'
        : route.kind === 'app'
          ? route.app
          : undefined;

  return (
    <aside className="browser-sidebar">
      <div className="sidebar-profile">
        <span className="sidebar-profile__avatar" aria-hidden="true">
          A
        </span>
        <div>
          <strong>{profile.name}</strong>
          <span>Independent builder</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Portfolio applications">
        <span className="sidebar-label">Workspace</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <AppLink
              key={item.href}
              href={item.href}
              className="sidebar-link"
              aria-current={active === item.route ? 'page' : undefined}
            >
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{item.label}</span>
              {active === item.route ? <span className="sidebar-link__dot" aria-hidden="true" /> : null}
            </AppLink>
          );
        })}
      </nav>

      <div className="sidebar-elsewhere">
        <span className="sidebar-label">Source</span>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
          className="sidebar-link sidebar-link--external"
        >
          <Github size={17} strokeWidth={1.8} aria-hidden="true" />
          <span>GitHub</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
        <a
          href={profile.x}
          target="_blank"
          rel="noreferrer noopener"
          className="sidebar-link sidebar-link--external"
        >
          <span className="sidebar-x" aria-hidden="true">
            𝕏
          </span>
          <span>@arjunsubramanya</span>
        </a>
      </div>

      <div className="sidebar-footer">
        <span className="sidebar-footer__count">
          {projects.length} projects · {featuredProjects.length} featured
        </span>
        <span>Evidence reviewed 1 Nov 2026</span>
        <span className="sidebar-footer__mono">Portfolio v1.0</span>
      </div>
    </aside>
  );
}

export function ProjectsBrowser({ active = true, primary = true }: { active?: boolean; primary?: boolean }) {
  const [filters, setFilters] = useState(emptyFilters);
  const HeroHeading = primary ? 'h1' : 'h2';
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => searchProjects(projects, filters), [filters]);
  const filtering = hasActiveFilters(filters);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);

  return (
    <div className="browser">
      <SidebarNav />
      <div className="browser-main">
        {!filtering ? (
          <section className="browser-hero">
            <div className="browser-hero__copy">
              <p className="eyebrow-row eyebrow-row--plain">
                <span className="eyebrow eyebrow--strong">Arjun Subramanya</span>
                <span className="eyebrow-note">Selected work · 2026</span>
              </p>
              <HeroHeading className="browser-hero__title">
                Complex workflows,
                <br />
                <em>made clear.</em>
              </HeroHeading>
              <p className="browser-hero__lede">
                I build Salesforce applications, native Apple experiences and analytics tools. Every
                project below links back to the repository it came from — including what it does not
                claim.
              </p>
              <div className="browser-hero__actions">
                <AppLink className="button button--primary" href="/resume/">
                  View the résumé
                  <ArrowRight size={16} aria-hidden="true" />
                </AppLink>
                <a
                  className="button button--quiet"
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Github size={16} aria-hidden="true" />
                  GitHub
                </a>
              </div>
            </div>

            <div className="browser-index" aria-label="Featured project index">
              <div className="browser-index__head">
                <span>Index</span>
                <span>{String(featuredProjects.length).padStart(2, '0')} featured</span>
              </div>
              {featuredProjects.map((project, index) => (
                <AppLink className="browser-index__item" href={`/projects/${project.slug}/`} key={project.slug}>
                  <span className="browser-index__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="browser-index__name">
                    {project.name}
                    <span>{project.category}</span>
                  </span>
                  <span
                    className="browser-index__swatch"
                    style={{ background: project.accent }}
                    aria-hidden="true"
                  />
                </AppLink>
              ))}
              <div className="browser-index__foot">
                <span>{profile.disciplines}</span>
              </div>
            </div>
          </section>
        ) : (
          <div className="browser-results-head">
            <span className="eyebrow">Project index</span>
            <HeroHeading className="browser-results-title">Find the work.</HeroHeading>
          </div>
        )}

        <ProjectFilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          inputRef={searchRef}
        />

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__mark">∅</span>
            <h2>No projects match that.</h2>
            <p>Try a platform, a tool like “Apex”, or a phrase from the project’s evidence.</p>
            <button type="button" className="button button--primary" onClick={() => setFilters(emptyFilters)}>
              Clear filters
            </button>
          </div>
        ) : filtering ? (
          <section className="project-section" aria-labelledby="results-heading">
            <div className="section-title-row">
              <h2 id="results-heading">Results</h2>
              <span>{filtered.length} of {projects.length}</span>
            </div>
            <div className="project-grid">
              {filtered.map((project, index) => (
                <ProjectCard project={project} key={project.slug} priority={index === 0} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className="project-section" aria-labelledby="featured-heading">
              <div className="section-title-row">
                <h2 id="featured-heading">Selected work</h2>
                <span>Built, tested and documented</span>
              </div>
              <div className="project-grid">
                {featuredProjects.map((project, index) => (
                  <ProjectCard project={project} key={project.slug} priority={index < 2} />
                ))}
              </div>
            </section>

            <section className="project-section project-section--compact" aria-labelledby="more-heading">
              <div className="section-title-row">
                <h2 id="more-heading">More public work</h2>
                <span>{extraProjects.length} projects</span>
              </div>
              <div className="compact-project-list">
                {extraProjects.map((project) => (
                  <CompactProjectRow project={project} key={project.slug} />
                ))}
              </div>
            </section>
          </>
        )}

        <footer className="browser-footer">
          <div>
            <span className="browser-footer__label">About the evidence</span>
            <p>
              Facts, test counts and limitations are quoted from public repositories reviewed on 1
              November 2026. Nothing is re-run or re-deployed for this portfolio.
            </p>
          </div>
          <div className="browser-footer__links">
            <AppLink href="/about/">How this was built</AppLink>
            <a href={profile.github} target="_blank" rel="noreferrer noopener">
              GitHub profile <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
