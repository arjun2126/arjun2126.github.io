import { ArrowUpRight, Github, Linkedin, Printer } from 'lucide-react';
import { useState } from 'react';
import { featuredProjects, projects } from '../content/projects';
import { profile, resumeCapabilities } from '../content/profile';
import { professional } from '../content/professional';
import { AppLink } from '../lib/navigation';

export function ResumeContent({ mode = 'window' }: { mode?: 'window' | 'document' }) {
  const [view, setView] = useState<'concise' | 'expanded'>('concise');
  const selected = view === 'concise' ? featuredProjects : projects;

  return (
    <div className={`resume-content resume-content--${mode}`}>
      <header className="resume-header">
        <div className="resume-header__copy">
          <span className="eyebrow">Evidence-based profile</span>
          <h1>
            Résumé<span className="accent-dot">.</span>
          </h1>
          <p>
            A profile built from approved employment and credentials, plus public project evidence.
            Credential IDs, contact details and unverified claims are deliberately excluded.
          </p>
        </div>
        <div className="resume-header__actions">
          {profile.resumePdf ? <a className="button button--small" href={profile.resumePdf} download="arjunos-resume.pdf">{profile.resumePdfLabel}</a> : null}
          <div className="segmented" role="group" aria-label="Résumé detail level">
            <button
              type="button"
              className={view === 'concise' ? 'is-active' : ''}
              aria-pressed={view === 'concise'}
              onClick={() => setView('concise')}
            >
              Concise
            </button>
            <button
              type="button"
              className={view === 'expanded' ? 'is-active' : ''}
              aria-pressed={view === 'expanded'}
              onClick={() => setView('expanded')}
            >
              Expanded
            </button>
          </div>
          <button type="button" className="button button--quiet button--small" onClick={() => window.print()}>
            <Printer size={15} aria-hidden="true" />
            Print / save PDF
          </button>
        </div>
      </header>

      <div className="resume-body" id="resume-document">
        <aside className="resume-rail" aria-label="Résumé identity and contact">
          <span className="resume-rail__monogram" aria-hidden="true">
            A
          </span>
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.disciplines}</p>
          </div>
          <div className="resume-rail__rule" />
          <dl className="resume-facts">
            <div>
              <dt>Current</dt>
              <dd>{professional.employment.find((role) => role.current)?.title || professional.employment[0]?.title || 'See experience'}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>Whitby, Ontario</dd>
            </div>
            <div>
              <dt>Reviewed</dt>
              <dd>2 November 2026</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>LinkedIn · GitHub</dd>
            </div>
          </dl>
          <div className="resume-rail__links">
            <a href={profile.github} target="_blank" rel="noreferrer noopener">
              <Github size={15} aria-hidden="true" />
              GitHub profile
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer noopener">
              <Linkedin size={15} aria-hidden="true" />
              linkedin.com/in/arjunsubra
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
          <p className="resume-rail__note">
            No email or phone is published. LinkedIn and GitHub are the verified contact routes.
          </p>
        </aside>

        <div className="resume-main">
          <section className="resume-section" aria-labelledby="resume-profile">
            <div className="resume-section__head">
              <span>01</span>
              <h2 id="resume-profile">Profile</h2>
            </div>
            <p className="resume-lead">{profile.summary}</p>
            <p>{profile.intro}</p>
            <div className="resume-scope">
              <strong>Scope of this document</strong>
              <p>{profile.resumeNote}</p>
            </div>
          </section>

          <section className="resume-section" aria-labelledby="resume-employment">
            <div className="resume-section__head">
              <span>02</span>
              <h2 id="resume-employment">Experience</h2>
            </div>
            <div className="resume-employment">
              {professional.employment.map((role) => (
                <article key={role.id}>
                  <div className="resume-employment__head">
                    <h3>{role.title}</h3>
                    <span className="resume-employment__period">{role.period}</span>
                  </div>
                  <p className="resume-employment__meta">
                    {role.employer} · {role.location}
                  </p>
                  <p>{role.summary}</p>
                  <ul>
                    {role.responsibilities.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="resume-section" aria-labelledby="resume-work">
            <div className="resume-section__head">
              <span>03</span>
              <h2 id="resume-work">Selected work</h2>
            </div>
            <div className="resume-work-list">
              {selected.map((project, index) => (
                <AppLink
                  className="resume-work"
                  href={`/projects/${project.slug}/`}
                  key={project.slug}
                >
                  <span className="resume-work__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="resume-work__copy">
                    <span className="resume-work__title">
                      {project.name}
                      <span className={`status-pill status-pill--${project.statusTone}`}>
                        {project.status}
                      </span>
                    </span>
                    <span className="resume-work__tagline">{project.tagline}</span>
                    {view === 'expanded' ? (
                      <span className="resume-work__evidence">
                        {project.evidence[0].value} · {project.evidence[0].label}
                      </span>
                    ) : null}
                  </span>
                  <span className="resume-work__category">{project.category}</span>
                  <ArrowUpRight className="resume-work__arrow" size={16} aria-hidden="true" />
                </AppLink>
              ))}
            </div>
            {view === 'concise' ? (
              <button type="button" className="text-button" onClick={() => setView('expanded')}>
                Show all {projects.length} projects
                <span aria-hidden="true">→</span>
              </button>
            ) : null}
          </section>

          <section className="resume-section" aria-labelledby="resume-capabilities">
            <div className="resume-section__head">
              <span>04</span>
              <h2 id="resume-capabilities">Capabilities</h2>
            </div>
            <div className="capability-grid">
              {resumeCapabilities.map((group) => (
                <div className="capability" key={group.label}>
                  <h3>{group.label}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="source-note">
              Skills are listed only where a public project or approved role uses them. This résumé
              deliberately does not assign proficiency scores or years of experience.
            </p>
            <div className="resume-credentials">
              <div>
                <h3>Education</h3>
                <ul>
                  {professional.education.map((entry) => (
                    <li key={entry.credential}>
                      {entry.credential} · {entry.institution}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Certifications</h3>
                <ul>
                  {professional.certifications.map((certification) => (
                    <li key={certification}>{certification}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {view === 'expanded' ? (
            <section className="resume-section" aria-labelledby="resume-principles">
              <div className="resume-section__head">
                <span>05</span>
                <h2 id="resume-principles">Working principles</h2>
              </div>
              <div className="resume-principles">
                {profile.approach.map((item, index) => (
                  <div key={item.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="resume-section resume-contact" aria-labelledby="resume-contact">
            <div className="resume-section__head">
              <span>{view === 'expanded' ? '06' : '05'}</span>
              <h2 id="resume-contact">Continue the conversation</h2>
            </div>
            <p>
              The public repositories contain the source, tests and documented limitations. For a
              conversation about the work, start there.
            </p>
            <div className="resume-contact__links">
              <a className="button button--primary" href={profile.github} target="_blank" rel="noreferrer noopener">
                <Github size={16} aria-hidden="true" />
                GitHub profile
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <AppLink className="button button--quiet" href="/contact/">
                Contact page
              </AppLink>
            </div>
          </section>

          <footer className="resume-footer">
            <span>{profile.name} · professional profile</span>
            <span>Sources reviewed 2 November 2026</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
