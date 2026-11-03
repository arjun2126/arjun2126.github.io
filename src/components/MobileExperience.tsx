import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  FileText,
  FolderOpen,
  Github,
  Home,
  Mail,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  extraProjects,
  featuredProjects,
  projects,
  projectBySlug,
} from '../content/projects';
import { profile, skillGroups } from '../content/profile';
import { hero } from '../content/expertise';
import { useNavigation } from '../lib/navigation';
import { AppLink } from '../lib/navigation';
import type { Route } from '../lib/router';
import { emptyFilters, hasActiveFilters, searchProjects } from '../lib/search';
import { AboutContent } from './AboutContent';
import { ContactContent } from './ContactContent';
import { AIView } from './os/AIView';
import { ContentStudio } from './os/ContentStudio';
import { ExperienceView } from './os/ExperienceView';
import { NorthgateLive } from './os/NorthgateLive';
import { Walkthrough } from './os/Walkthrough';
import { SalesforceView } from './os/SalesforceView';
import { LogoMark } from './Logo';
import { OsMark, Portrait } from './os/parts';
import { NotFoundContent } from './NotFoundContent';
import { CompactProjectRow, ProjectCard } from './ProjectCard';
import { ProjectArticle } from './ProjectArticle';
import { ProjectFilterBar } from './ProjectFilterBar';
import { ResumeContent } from './ResumeContent';
import { SkillsExplorer } from './SkillsExplorer';

function mobileActive(route: Route, tab: string): boolean {
  if (tab === 'home') return route.kind === 'home';
  if (tab === 'work') return route.kind === 'project';
  if (tab === 'resume') return route.kind === 'app' && route.app === 'resume';
  if (tab === 'skills') return route.kind === 'app' && route.app === 'skills';
  if (tab === 'contact') return route.kind === 'app' && route.app === 'contact';
  return false;
}

function MobileHeader() {
  return (
    <header className="m-header">
      <AppLink href="/" className="m-brand">
        <OsMark size="md" />
        <span>ArjunOS</span>
      </AppLink>
      <nav className="m-header__nav" aria-label="Header">
        <AppLink href="/recruiter/">Recruiter</AppLink>
        <AppLink href="/about/">About</AppLink>
        <AppLink href="/resume/" className="m-header__cta">
          Résumé
        </AppLink>
      </nav>
    </header>
  );
}

function MobileTabBar({ route }: { route: Route }) {
  const items = [
    { tab: 'home', href: '/', label: 'Home', icon: Home },
    { tab: 'work', href: '/#work', label: 'Work', icon: FolderOpen },
    { tab: 'resume', href: '/resume/', label: 'Résumé', icon: FileText },
    { tab: 'skills', href: '/skills/', label: 'Skills', icon: Sparkles },
    { tab: 'contact', href: '/contact/', label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="m-tabbar" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = mobileActive(route, item.tab);
        return (
          <AppLink
            key={item.tab}
            href={item.href}
            className={`m-tab${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
            <span>{item.label}</span>
          </AppLink>
        );
      })}
    </nav>
  );
}

function MobileFooter() {
  return (
    <footer className="m-footer">
      <div className="m-footer__brand">
        <LogoMark />
        <div>
          <strong>ArjunOS</strong>
          <span>A portfolio of documented work.</span>
        </div>
      </div>
      <p>
        Professional details come from the owner-approved handoff reviewed on 2 November 2026.
        Project facts are quoted from public repositories. No email or phone number is published.
      </p>
      <div className="m-footer__links">
        <AppLink href="/">Projects</AppLink>
        <AppLink href="/resume/">Résumé</AppLink>
        <AppLink href="/skills/">Skills</AppLink>
        <AppLink href="/about/">About</AppLink>
        <AppLink href="/contact/">Contact</AppLink>
        <a href={profile.github} target="_blank" rel="noreferrer noopener">
          GitHub <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </div>
      <span className="m-footer__fine">ArjunOS · Built with React, TypeScript and Vite</span>
    </footer>
  );
}

function MobileHome() {
  const [filters, setFilters] = useState(emptyFilters);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtering = hasActiveFilters(filters);
  const filtered = searchProjects(projects, filters);
  const salesforceCount = projects.filter((project) => project.category === 'Salesforce').length;
  const intro = (
    <>
      <p className="m-hero__headline">{hero.headline}</p>
      <p className="m-hero__statement">{profile.headline}</p>
      <p className="m-hero__body">{profile.intro}</p>
    </>
  );

  return (
    <div className="m-home">
      <section className="m-hero" aria-labelledby="mobile-hero-title">
        <p className="eyebrow">Independent software portfolio</p>
        <h1 id="mobile-hero-title" aria-label={`Hi, I'm ${profile.name}.`}>
          <span className="m-hero__greeting" aria-hidden="true">{hero.greeting}</span>
          <span className="m-hero__name" aria-hidden="true">{profile.name}.</span>
        </h1>
        {profile.photo ? (
          <div className="m-hero__identity">
            <div className="m-hero__portrait">
              <Portrait />
            </div>
            <div className="m-hero__intro">{intro}</div>
          </div>
        ) : (
          intro
        )}
        <div className="m-hero__actions">
          <AppLink href="/#work" className="button button--primary">
            See the work
            <ArrowDown size={16} aria-hidden="true" />
          </AppLink>
          <AppLink href="/resume/" className="button button--quiet">
            View résumé
          </AppLink>
        </div>
        <div className="m-disciplines" aria-label="Disciplines">
          <div>
            <span>01</span>
            <strong>Salesforce</strong>
            <span>{salesforceCount} projects</span>
          </div>
          <div>
            <span>02</span>
            <strong>Apple</strong>
            <span>1 project</span>
          </div>
          <div>
            <span>03</span>
            <strong>Analytics</strong>
            <span>1 project</span>
          </div>
          <div>
            <span>04</span>
            <strong>Backend</strong>
            <span>2 projects</span>
          </div>
        </div>
      </section>

      <section className="m-section" id="work" aria-labelledby="mobile-work-title">
        <div className="m-section__head">
          <span className="eyebrow">Selected work</span>
          <h2 id="mobile-work-title">
            The work, <em>in public.</em>
          </h2>
          <p>Four case studies, plus four more repositories. Search or filter by discipline.</p>
        </div>

        <ProjectFilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          inputRef={searchRef}
          compact
        />

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No projects match that.</h3>
            <p>Try a platform, a tool, or a phrase from the evidence.</p>
            <button type="button" className="button button--primary" onClick={() => setFilters(emptyFilters)}>
              Clear filters
            </button>
          </div>
        ) : filtering ? (
          <div className="m-project-grid">
            {filtered.map((project, index) => (
              <ProjectCard project={project} key={project.slug} priority={index === 0} />
            ))}
          </div>
        ) : (
          <>
            <div className="m-project-grid">
              {featuredProjects.map((project, index) => (
                <ProjectCard project={project} key={project.slug} priority={index === 0} />
              ))}
            </div>
            <div className="m-compact-list">
              <div className="m-list-label">
                <span>More public work</span>
                <span>{extraProjects.length} projects</span>
              </div>
              {extraProjects.map((project) => (
                <CompactProjectRow project={project} key={project.slug} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="m-section m-resume-teaser" aria-labelledby="mobile-resume-title">
        <div className="m-section__head">
          <span className="eyebrow">Résumé</span>
          <h2 id="mobile-resume-title">
            A profile built <em>from evidence.</em>
          </h2>
          <p>{profile.summary}</p>
        </div>
        <ul className="m-capabilities">
          <li>Apex & LWC</li>
          <li>Experience Cloud</li>
          <li>Swift & watchOS</li>
          <li>Python analytics</li>
          <li>Streamlit & BI</li>
          <li>Automated tests</li>
        </ul>
        <AppLink href="/resume/" className="button button--primary">
          Read the full résumé
          <ArrowRight size={16} aria-hidden="true" />
        </AppLink>
        <p className="m-fineprint">
          Roles, education and certification names come from the approved professional handoff.
          Credential IDs and proficiency scores are not published.
        </p>
      </section>

      <section className="m-section m-skills-teaser" aria-labelledby="mobile-skills-title">
        <div className="m-section__head">
          <span className="eyebrow">Skills explorer</span>
          <h2 id="mobile-skills-title">
            A toolkit you can <em>trace.</em>
          </h2>
        </div>
        <div className="m-skill-groups">
          {skillGroups.map((group) => (
            <AppLink href="/skills/" key={group.id} className="m-skill-group">
              <span>{group.label}</span>
              <strong>{group.skills.length}</strong>
              <ArrowUpRight size={14} aria-hidden="true" />
            </AppLink>
          ))}
        </div>
        <AppLink href="/skills/" className="text-link">
          Explore every skill <ArrowRight size={14} aria-hidden="true" />
        </AppLink>
      </section>

      <section className="m-section m-about-teaser" aria-labelledby="mobile-about-title">
        <div className="m-section__head">
          <span className="eyebrow">About</span>
          <h2 id="mobile-about-title">
            Evidence over <em>adjectives.</em>
          </h2>
        </div>
        <div className="m-principles">
          {profile.approach.map((item, index) => (
            <div key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <AppLink href="/about/" className="text-link">
          More about the work and this site <ArrowRight size={14} aria-hidden="true" />
        </AppLink>
      </section>

      <section className="m-contact-cta" aria-labelledby="mobile-contact-title">
        <span className="eyebrow">Contact</span>
        <h2 id="mobile-contact-title">
          Let’s talk about <em>the work.</em>
        </h2>
        <p>{profile.contactIntro}</p>
        <div className="m-contact-cta__actions">
          <AppLink href="/contact/" className="button button--light">
            <Mail size={16} aria-hidden="true" />
            Contact
          </AppLink>
          <a
            className="button button--ghost-light"
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Github size={16} aria-hidden="true" />
            GitHub
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}

export function MobileExperience({ route }: { route: Route }) {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route.path]);

  let content;
  if (route.kind === 'home') {
    content = <MobileHome />;
  } else if (route.kind === 'project') {
    const project = projectBySlug[route.slug];
    content = project ? (
      <div className="m-page m-page--project">
        <ProjectArticle project={project} mode="document" />
      </div>
    ) : (
      <div className="m-page">
        <NotFoundContent path={route.path} />
      </div>
    );
  } else if (route.kind === 'app') {
    const osDocument =
      route.app === 'ai' ||
      route.app === 'experience' ||
      route.app === 'salesforce' ||
      route.app === 'live' ||
      route.app === 'content';
    content = (
      <div className={`m-page m-page--${route.app}${osDocument ? ' m-page--os' : ''}`}>
        {route.app === 'resume' ? <ResumeContent mode="document" /> : null}
        {route.app === 'skills' ? <SkillsExplorer mode="document" /> : null}
        {route.app === 'about' ? <AboutContent mode="document" /> : null}
        {route.app === 'contact' ? <ContactContent mode="document" /> : null}
        {route.app === 'projects' ? <MobileHome /> : null}
        {route.app === 'ai' ? <AIView tone="light" /> : null}
        {route.app === 'experience' ? <ExperienceView tone="light" /> : null}
        {route.app === 'salesforce' ? <SalesforceView tone="light" /> : null}
        {route.app === 'live' ? <NorthgateLive tone="light" /> : null}
        {route.app === 'walkthrough' ? <Walkthrough /> : null}
        {route.app === 'content' ? <ContentStudio /> : null}
      </div>
    );
  } else {
    content = (
      <div className="m-page">
        <NotFoundContent path={route.path} />
      </div>
    );
  }

  return (
    <div className="mobile">
      <MobileHeader />
      <main id="main-content" className="m-main">
        {content}
      </main>
      <MobileFooter />
      <MobileTabBar route={route} />
    </div>
  );
}
