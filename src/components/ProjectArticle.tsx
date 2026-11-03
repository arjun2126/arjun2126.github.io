import { ArrowLeft, ArrowRight, ArrowUpRight, ImageOff, MonitorPlay, ShieldAlert } from 'lucide-react';
import { northgateLiveHome } from '../content/northgateLive';
import { projects, type Project } from '../content/projects';
import { AppLink } from '../lib/navigation';
import { Gallery } from './Gallery';
import { TypographicPoster } from './TypographicPoster';

function nextProject(project: Project): Project {
  const index = projects.findIndex((entry) => entry.slug === project.slug);
  return projects[(index + 1) % projects.length];
}

export function ProjectArticle({
  project,
  mode = 'window',
}: {
  project: Project;
  mode?: 'window' | 'document';
}) {
  const next = nextProject(project);

  return (
    <article className={`project-article project-article--${mode}`}>
      <div className="project-article__toolbar">
        <AppLink className="back-link" href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          All projects
        </AppLink>
        <a
          className="source-link"
          href={project.repo}
          target="_blank"
          rel="noreferrer noopener"
        >
          View source
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>

      <header className="project-hero">
        <div className="project-hero__copy">
          <div className="eyebrow-row">
            <span className="eyebrow">{project.category}</span>
            <span className={`status-pill status-pill--${project.statusTone}`}>{project.status}</span>
          </div>
          <h1>{project.name}</h1>
          <p className="project-hero__tagline">{project.tagline}</p>
          <p className="project-hero__summary">{project.summary}</p>
          <div className="tag-row tag-row--large">
            {project.stack.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="project-hero__actions">
            {project.link ? <a className="button button--quiet" href={project.link} target="_blank" rel="noopener noreferrer">{project.linkLabel}</a> : null}
            <a
              className="button button--primary"
              href={project.repo}
              target="_blank"
              rel="noreferrer noopener"
            >
              Read the repository
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <AppLink className="button button--quiet" href="/resume/">
              Evidence-based résumé
            </AppLink>
          </div>
        </div>
        <aside className="project-meta" aria-label="Project source details">
          <div className="project-meta__row">
            <span>Discipline</span>
            <strong>{project.category}</strong>
          </div>
          <div className="project-meta__row">
            <span>Status</span>
            <strong>{project.status}</strong>
          </div>
          <div className="project-meta__row">
            <span>Source</span>
            <strong>{project.repoRevision}</strong>
          </div>
          <p>{project.repoNote}</p>
          <span className="project-meta__stamp">Public repository · reviewed Nov 2026</span>
        </aside>
      </header>

      {project.hero ? (
        <figure className="project-hero-image">
          <div className="project-hero-image__frame">
            <img
              src={project.hero.src}
              srcSet={
                project.hero.srcSmall
                  ? `${project.hero.srcSmall} 800w, ${project.hero.src} 1600w`
                  : undefined
              }
              sizes="(max-width: 900px) calc(100vw - 40px), 860px"
              alt={project.hero.alt}
              decoding="async"
            />
          </div>
          <figcaption>
            <span>{project.hero.caption}</span>
            <span className="figure-source">Source: public repository</span>
          </figcaption>
        </figure>
      ) : project.cover.kind === 'typographic' ? (
        <figure className="project-hero-image project-hero-image--poster">
          <TypographicPoster project={project} hero />
          <figcaption>
            <span>{project.cover.caption}</span>
            <span className="figure-source">Typographic cover, not a product capture</span>
          </figcaption>
        </figure>
      ) : null}

      {project.slug === 'northgate-motors' ? (
        <section className="northgate-live-cta" aria-labelledby="northgate-live-title">
          <div className="northgate-live-cta__copy">
            <span className="eyebrow">Live buyer experience</span>
            <h2 id="northgate-live-title">Walk the published Salesforce site.</h2>
            <p>
              Explore the real Experience Cloud buyer routes alongside genuine captures. Salesforce
              currently blocks third-party framing, so the live window is an explicit preview with a
              direct route to the original site — not a copy pretending to be live.
            </p>
          </div>
          <div className="northgate-live-cta__actions">
            <AppLink className="button button--primary" href="/northgate-live/">
              <MonitorPlay size={16} aria-hidden="true" />
              Open Live Experience
            </AppLink>
            <a
              className="button button--quiet"
              href={northgateLiveHome.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open live buyer site
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
          <p className="northgate-live-cta__note">
            Authenticated Owner Portal excluded. No Salesforce credentials or session data are used.
          </p>
        </section>
      ) : null}

      <section className="article-section">
        <div className="section-heading">
          <span className="section-number">01</span>
          <h2>What it demonstrates</h2>
        </div>
        <div className="highlight-grid">
          {project.highlights.map((highlight, index) => (
            <div className="highlight-card" key={highlight.title}>
              <span className="highlight-card__number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{highlight.title}</h3>
              <p>{highlight.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="article-section">
        <div className="section-heading">
          <span className="section-number">02</span>
          <h2>Evidence from the source</h2>
        </div>
        <div className="evidence-grid">
          {project.evidence.map((item) => (
            <div className="evidence-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="source-note source-note--bordered">{project.evidenceNote}</p>
      </section>

      {project.gallery.length > 0 ? (
        <section className="article-section">
          <div className="section-heading">
            <span className="section-number">03</span>
            <h2>Inside the work</h2>
          </div>
          <Gallery images={project.gallery} note={project.galleryNote} />
        </section>
      ) : (
        <section className="article-section">
          <div className="section-heading">
            <span className="section-number">03</span>
            <h2>Inside the work</h2>
          </div>
          <div className="no-gallery">
            <ImageOff size={26} aria-hidden="true" />
            <div>
              <h3>No screenshots published</h3>
              <p>
                The public repository does not include app imagery. This portfolio does not substitute a
                reconstruction for a genuine capture; read the source for the implementation.
              </p>
              <a href={project.repo} target="_blank" rel="noreferrer noopener" className="text-link">
                Open the repository <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="article-section limitation-section" aria-labelledby="limitations-title">
        <div className="limitation-card">
          <div className="limitation-card__icon">
            <ShieldAlert size={21} aria-hidden="true" />
          </div>
          <div>
            <h2 id="limitations-title">What this page does not claim</h2>
            <ul>
              {project.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="project-footer">
        <AppLink className="next-project" href={`/projects/${next.slug}/`}>
          <span className="next-project__label">Next project</span>
          <span className="next-project__name">
            {next.name}
            <ArrowRight size={20} aria-hidden="true" />
          </span>
          <span className="next-project__tagline">{next.tagline}</span>
        </AppLink>
        <div className="project-footer__meta">
          <p>{project.repoNote}</p>
          <a href={project.repo} target="_blank" rel="noreferrer noopener">
            View source on GitHub
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </article>
  );
}
