import type { CSSProperties } from 'react';
import type { Project } from '../content/projects';

export function TypographicPoster({
  project,
  compact = false,
  hero = false,
}: {
  project: Project;
  compact?: boolean;
  hero?: boolean;
}) {
  const style = {
    '--poster-accent': project.accent,
    '--poster-soft': project.accentSoft,
  } as CSSProperties;

  return (
    <div
      className={`poster poster--${project.slug}${compact ? ' poster--compact' : ''}${hero ? ' poster--hero' : ''}`}
      style={style}
      role="img"
      aria-label={project.cover.alt}
    >
      <div className="poster__inner" aria-hidden="true">
        {project.slug === 'vantage' ? (
          <>
            <span className="poster__kicker">Tennis · iOS + watchOS</span>
            <span className="poster__court" />
            <span className="poster__word">Vantage</span>
            <span className="poster__score">
              <span>40</span>
              <span className="poster__score-divider">:</span>
              <span>30</span>
            </span>
            <span className="poster__score-meta">Sets 1–1 · Game 5</span>
            <span className="poster__ball" />
            <span className="poster__note">Typographic cover · no app screenshots published</span>
          </>
        ) : (
          <>
            <span className="poster__kicker">{project.category} · public work</span>
            <span className="poster__mark">{project.mark}</span>
            <span className="poster__word">{project.name}</span>
            <span className="poster__rule" />
            <span className="poster__note">Typographic cover · no screenshots published</span>
          </>
        )}
      </div>
    </div>
  );
}
