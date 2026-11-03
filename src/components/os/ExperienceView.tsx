import { ArrowUpRight, Award, GraduationCap } from 'lucide-react';
import { experienceEntries, independentEntries } from '../../content/expertise';
import { professional } from '../../content/professional';
import { projectBySlug } from '../../content/projects';
import { resumeCapabilities } from '../../content/profile';
import { AppLink } from '../../lib/navigation';

export function ExperienceView({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <div className={`os-app os-experience os-experience--${tone}${tone === 'light' ? ' os-app--light' : ''}`}>
      <header className="os-experience__header">
        <p className="os-experience__eyebrow">Experience</p>
        <h1>Business systems, from administration to code.</h1>
        <p className="os-experience__lede">
          Two professional roles, documented in the approved handoff, plus independent projects kept
          separate on purpose. No total-years figure, continuous-duration graphic or unverified
          technical claim is used.
        </p>
      </header>

      <section aria-labelledby="professional-experience">
        <h2 className="os-experience__subheading" id="professional-experience">
          Professional employment
        </h2>
        <ol className="os-experience__list">
          {experienceEntries.map((entry) => (
            <li key={`${entry.org}-${entry.period}`}>
              <span className="os-experience__period">{entry.period}</span>
              <div className="os-experience__body">
                <h2>{entry.title}</h2>
                <p className="os-experience__org">{entry.org}</p>
                <p>{entry.body}</p>
                <ul className="os-experience__responsibilities">
                  {entry.responsibilities.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="independent-experience">
        <h2 className="os-experience__subheading" id="independent-experience">
          Independent work · not employment
        </h2>
        <ol className="os-experience__list">
          {independentEntries.map((entry) => (
            <li key={entry.title}>
              <span className="os-experience__period">{entry.period}</span>
              <div className="os-experience__body">
                <h2>{entry.title}</h2>
                <p className="os-experience__org">{entry.org}</p>
                <p>{entry.body}</p>
                <div className="os-experience__links">
                  {entry.projectSlugs.map((slug) => {
                    const project = projectBySlug[slug];
                    return project ? (
                      <AppLink key={slug} href={`/projects/${slug}/`}>
                        {project.name}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </AppLink>
                    ) : null;
                  })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="os-experience__credentials" aria-labelledby="education-credentials">
        <div>
          <h2 className="os-experience__subheading" id="education-credentials">
            <GraduationCap size={17} aria-hidden="true" /> Education
          </h2>
          <ul className="os-experience__credential-list">
            {professional.education.map((entry) => (
              <li key={entry.credential}>
                <strong>{entry.credential}</strong>
                <span>{entry.institution} · {entry.location}</span>
                <span>{entry.focus} · {entry.dates}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="os-experience__subheading">
            <Award size={17} aria-hidden="true" /> Certifications
          </h2>
          <ul className="os-experience__credential-list">
            {professional.certifications.map((certification) => (
              <li key={certification}>
                <strong>{certification}</strong>
                <span>Salesforce · credential ID withheld</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="os-experience__capabilities" aria-labelledby="experience-capabilities">
        <h2 id="experience-capabilities">Capabilities in practice</h2>
        <div className="os-experience__capability-grid">
          {resumeCapabilities.map((group) => (
            <div key={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="os-experience__actions">
          <AppLink className="os-button os-button--primary" href="/resume/">
            Open the résumé
          </AppLink>
          <AppLink className="os-button os-button--quiet" href="/recruiter/">
            Recruiter Mode
          </AppLink>
        </div>
      </section>
    </div>
  );
}
