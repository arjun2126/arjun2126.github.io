import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../content/projects';
import { projectHref } from '../content/projects';
import { AppLink } from '../lib/navigation';
import { TypographicPoster } from './TypographicPoster';

export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  return (
    <article className={`project-card project-card--${project.slug}`}>
      <AppLink className="project-card__link" href={projectHref(project.slug)}>
        <div className="project-card__media">
          {project.cover.kind === 'image' && project.cover.src ? (
            <img
              src={project.cover.src}
              srcSet={
                project.cover.srcSmall
                  ? `${project.cover.srcSmall} 800w, ${project.cover.src} 1600w`
                  : undefined
              }
              sizes="(max-width: 620px) calc(100vw - 44px), 460px"
              alt={project.cover.alt}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <TypographicPoster project={project} compact />
          )}
          <span className="project-card__category">
            <span className="category-dot" style={{ background: project.accent }} />
            {project.category}
          </span>
        </div>
        <div className="project-card__body">
          <div className="project-card__title-row">
            <h3>{project.name}</h3>
            <ArrowUpRight className="project-card__arrow" size={19} aria-hidden="true" />
          </div>
          <p>{project.tagline}</p>
          <div className="tag-row">
            {project.stack.slice(0, 3).map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
            {project.stack.length > 3 ? (
              <span className="tag tag--ghost">+{project.stack.length - 3}</span>
            ) : null}
          </div>
        </div>
      </AppLink>
    </article>
  );
}

export function CompactProjectRow({ project }: { project: Project }) {
  return (
    <AppLink className="compact-project" href={projectHref(project.slug)}>
      <span
        className="compact-project__mark"
        style={{ background: project.accentSoft, color: project.accent }}
        aria-hidden="true"
      >
        {project.mark}
      </span>
      <span className="compact-project__copy">
        <span className="compact-project__title">
          {project.name}
          <span className="compact-project__status">{project.status}</span>
        </span>
        <span className="compact-project__tagline">{project.tagline}</span>
      </span>
      <span className="compact-project__category">{project.category}</span>
      <ArrowUpRight className="compact-project__arrow" size={17} aria-hidden="true" />
    </AppLink>
  );
}
