import { ArrowUpRight, Award, FileText, GraduationCap, Linkedin, Mail, MapPin } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { featuredProjects } from '../../content/projects';
import { hero, recruiter, recruiterTabs, type RecruiterTab } from '../../content/expertise';
import { professional } from '../../content/professional';
import { AppLink } from '../../lib/navigation';
import { OsMark, Portrait, Wallpaper } from './parts';

function RecruiterActions({ top = false }: { top?: boolean }) {
  return (
    <div className={`os-recruiter__actions${top ? ' os-recruiter__actions--top' : ''}`}>
      <AppLink className="os-button os-button--blue" href="/resume/">
        <FileText size={15} aria-hidden="true" />
        View Résumé
      </AppLink>
      <AppLink className="os-button os-button--outline" href="/contact/">
        <Mail size={15} aria-hidden="true" />
        Contact Me
      </AppLink>
    </div>
  );
}

export function RecruiterView({ standalone = false }: { standalone?: boolean }) {
  const [active, setActive] = useState<RecruiterTab['id']>('overview');
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % recruiterTabs.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + recruiterTabs.length) % recruiterTabs.length
          : event.key === 'Home'
            ? 0
            : recruiterTabs.length - 1;
    const tab = recruiterTabs[nextIndex];
    setActive(tab.id);
    tabRefs.current[tab.id]?.focus();
  };

  return (
    <div className={`os-recruiter${standalone ? ' os-recruiter--standalone' : ''}`}>
      {!standalone ? (
        <header className="os-recruiter__identity">
          <Portrait size="avatar" />
          <div>
            <p className="os-recruiter__name">{recruiter.name}</p>
            <p className="os-recruiter__role">
              {hero.headline}
              <span className="os-recruiter__location">
                <MapPin size={10} aria-hidden="true" /> {professional.location}
              </span>
            </p>
          </div>
        </header>
      ) : null}

      {standalone ? <RecruiterActions top /> : null}

      <div className="os-recruiter__tabs" role="tablist" aria-label="Recruiter profile sections">
        {recruiterTabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[tab.id] = element;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className={`os-recruiter__tab${active === tab.id ? ' is-active' : ''}`}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="os-recruiter__panel"
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
      >
        {active === 'overview' ? (
          <>
            <h2>Professional Summary</h2>
            <p className="os-recruiter__summary">{recruiter.summary}</p>
            <ul className="os-recruiter__details">
              {recruiter.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            <div className="os-recruiter__selected">
              <h3>Selected work</h3>
              <div className="os-recruiter__selected-grid">
                {featuredProjects.map((project) => (
                  <AppLink key={project.slug} href={`/projects/${project.slug}/`}>
                    <span>{project.name}</span>
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </AppLink>
                ))}
              </div>
            </div>
            <p className="os-recruiter__availability">
              {professional.location} · {professional.availability}
            </p>
          </>
        ) : null}

        {active === 'experience' ? (
          <div className="os-recruiter__stack">
            {recruiter.experience.map((entry) => (
              <article key={entry.title}>
                <h3>{entry.title}</h3>
                <p className="os-recruiter__meta">{entry.meta}</p>
                <p>{entry.body}</p>
              </article>
            ))}
            <p className="os-recruiter__note">{recruiter.note}</p>
          </div>
        ) : null}

        {active === 'skills' ? (
          <div className="os-recruiter__skills">
            {recruiter.skills.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}

        {active === 'projects' ? (
          <ul className="os-recruiter__projects">
            {featuredProjects.map((project) => (
              <li key={project.slug}>
                <AppLink href={`/projects/${project.slug}/`}>
                  <span>
                    <strong>{project.name}</strong>
                    <span>{project.tagline}</span>
                  </span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </AppLink>
              </li>
            ))}
          </ul>
        ) : null}

        {active === 'credentials' ? (
          <div className="os-recruiter__credentials">
            <section>
              <h3>
                <GraduationCap size={13} aria-hidden="true" /> Education
              </h3>
              {professional.education.map((entry) => (
                <article key={entry.credential}>
                  <strong>{entry.credential}</strong>
                  {[entry.institution, entry.location].filter(Boolean).length ? (
                    <p>{[entry.institution, entry.location].filter(Boolean).join(' · ')}</p>
                  ) : null}
                  {[entry.focus, entry.dates].filter(Boolean).length ? (
                    <p className="os-recruiter__meta">
                      {[entry.focus, entry.dates].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </article>
              ))}
            </section>
            <section>
              <h3>
                <Award size={13} aria-hidden="true" /> Certifications
              </h3>
              <ul>
                {professional.certifications.map((certification) => (
                  <li key={certification}>{certification}</li>
                ))}
              </ul>
              <p className="os-recruiter__meta">Names only; credential IDs are not published.</p>
            </section>
          </div>
        ) : null}
      </div>

      {!standalone ? <RecruiterActions /> : null}

      {!standalone ? (
        <AppLink className="os-recruiter__full" href="/recruiter/">
          Open the full recruiter view
          <ArrowUpRight size={13} aria-hidden="true" />
        </AppLink>
      ) : null}
    </div>
  );
}

export function RecruiterStandalone() {
  return (
    <div className="os-standalone">
      <Wallpaper />
      <header className="os-standalone__bar">
        <AppLink href="/" className="os-standalone__brand">
          <OsMark size="sm" />
          <span>ArjunOS</span>
        </AppLink>
        <nav aria-label="Recruiter view">
          <AppLink href="/">Back to desktop</AppLink>
          <AppLink href="/projects/">Projects</AppLink>
          <a href={professional.linkedin} target="_blank" rel="noreferrer noopener">
            <Linkedin size={13} aria-hidden="true" /> LinkedIn
          </a>
        </nav>
      </header>

      <main id="main-content" className="os-standalone__main">
        <div className="os-sheet">
          <div className="os-sheet__top">
            <div className="os-sheet__identity">
              <Portrait size="card" />
              <div>
                <p className="os-sheet__eyebrow">Recruiter Mode</p>
                <h1>{recruiter.name}</h1>
                <p className="os-sheet__headline">{hero.headline}</p>
                <p className="os-sheet__location">
                  <MapPin size={12} aria-hidden="true" /> {professional.location} · Open to roles across Canada
                </p>
              </div>
            </div>
            <p className="os-sheet__intro">{professional.specialization}</p>
          </div>

          <RecruiterView standalone />

          <footer className="os-sheet__footer">
            <p>{recruiter.note}</p>
            <p>
              Evidence reviewed 2 November 2026 ·{' '}
              <a href={professional.github} target="_blank" rel="noreferrer noopener">
                github.com/arjun2126
              </a>{' '}
              ·{' '}
              <a href={professional.linkedin} target="_blank" rel="noreferrer noopener">
                linkedin.com/in/arjunsubra
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
