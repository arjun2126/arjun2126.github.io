import { ArrowUpRight, Github } from 'lucide-react';
import { featuredProjects, projects } from '../content/projects';
import { profile } from '../content/profile';
import { AppLink } from '../lib/navigation';
import { Monogram } from './Logo';

export function AboutContent({ mode = 'window' }: { mode?: 'window' | 'document' }) {
  return (
    <div className={`about-content about-content--${mode}`}>
      <header className="about-hero">
        <div className="about-hero__copy">
          <span className="eyebrow">About</span>
          <h1>
            A portfolio that
            <br />
            <em>shows its work.</em>
          </h1>
          <p>
            I’m Arjun, a Salesforce developer and administrator based in Whitby, Ontario. I build
            business systems, analytics tools and native Apple experiences — and I document the work
            rather than just describing it.
          </p>
          <p className="about-hero__meta">
            Currently Business Systems Developer &amp; Administrator at SWR, Waterloo Region.
          </p>
        </div>
        <div className="about-portrait" aria-label="Typographic portrait of Arjun Subramanya">
          <div className="about-portrait__sun" aria-hidden="true" />
          <Monogram />
          <div className="about-portrait__foot">
            <span>Independent software portfolio</span>
            <span>Public sources · 2026</span>
          </div>
        </div>
      </header>

      <section className="about-section" aria-labelledby="about-approach">
        <div className="section-heading">
          <span className="section-number">01</span>
          <h2 id="about-approach">How I work</h2>
        </div>
        <div className="about-principles">
          {profile.approach.map((item, index) => (
            <article key={item.title}>
              <span className="about-principles__number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" aria-labelledby="about-numbers">
        <div className="section-heading">
          <span className="section-number">02</span>
          <h2 id="about-numbers">The public record</h2>
        </div>
        <div className="about-stats">
          <div>
            <strong>{projects.length}</strong>
            <span>public projects</span>
          </div>
          <div>
            <strong>{featuredProjects.length}</strong>
            <span>selected case studies</span>
          </div>
          <div>
            <strong>3</strong>
            <span>platform disciplines</span>
          </div>
          <div>
            <strong>0</strong>
            <span>invented metrics</span>
          </div>
        </div>
        <p className="source-note">
          Reviewed 2 November 2026. Counts describe this portfolio and its public repositories, not
          years of experience or commercial outcomes.
        </p>
      </section>

      <section className="about-section" aria-labelledby="about-site">
        <div className="section-heading">
          <span className="section-number">03</span>
          <h2 id="about-site">About this interface</h2>
        </div>
        <div className="about-prose">
          <p>
            ArjunOS is a browsing device, not an operating-system emulator. The desktop allows several
            projects and documents to stay open at once; the mobile layout drops the metaphor entirely
            and becomes a normal, scrollable document.
          </p>
          <p>
            The interface is built with React, TypeScript and Vite, with content separated from
            presentation. Project pages are pre-rendered with their own metadata so they remain
            directly linkable, searchable and readable without the desktop.
          </p>
          <p>
            Every project claim has a source. Where the source said something was unverified, the
            portfolio says so too. Where the repository did not publish screenshots, no reconstruction
            is passed off as one.
          </p>
        </div>
        <div className="about-callout">
          <strong>Publication boundaries</strong>
          <p>{profile.resumeNote}</p>
        </div>
      </section>

      <footer className="about-footer">
        <div>
          <span className="eyebrow">Next</span>
          <h2>Read the work, then the source.</h2>
        </div>
        <div className="about-footer__actions">
          <AppLink className="button button--primary" href="/">
            Browse projects
          </AppLink>
          <a
            className="button button--quiet"
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Github size={16} aria-hidden="true" />
            GitHub
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
