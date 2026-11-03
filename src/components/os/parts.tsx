import { ArrowUpRight, Cloud, Cpu, FileText, LineChart, Smartphone } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { profile } from '../../content/profile';
import type { Project } from '../../content/projects';
import { AppLink } from '../../lib/navigation';

export function Wallpaper() {
  return (
    <div className="os-wallpaper" aria-hidden="true">
      <img src="/wallpaper-alpine.webp" alt="" width="2400" height="1573" decoding="async" />
      <div className="os-wallpaper__tint" />
      <div className="os-wallpaper__grain" />
    </div>
  );
}

export function OsMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`os-mark os-mark--${size}`} aria-hidden="true">
      <span>A</span>
    </span>
  );
}

export function Portrait({ size = 'hero' }: { size?: 'hero' | 'avatar' | 'card' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasPhoto = Boolean(profile.photo) && !imageFailed;

  return (
    <div className={`os-portrait os-portrait--${size}${hasPhoto ? ' os-portrait--photo' : ''}`}>
      {hasPhoto ? (
        <img
          className="os-portrait__image"
          src={profile.photo}
          alt={profile.photoAlt ?? `Portrait of ${profile.name}`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="os-portrait__placeholder"
          role="img"
          aria-label={`Portrait placeholder for ${profile.name}. An approved photograph has not been provided.`}
        >
          <span className="os-portrait__halo" aria-hidden="true" />
          <span className="os-portrait__initials" aria-hidden="true">
            AS
          </span>
          <span className="os-portrait__caption" aria-hidden="true">
            Portrait pending
          </span>
        </div>
      )}
    </div>
  );
}

export function ProjectMedia({ project, priority = false }: { project: Project; priority?: boolean }) {
  if (project.cover.kind === 'image' && project.cover.src) {
    return (
      <img
        src={project.cover.src}
        srcSet={
          project.cover.srcSmall
            ? `${project.cover.srcSmall} 800w, ${project.cover.src} 1600w`
            : undefined
        }
        sizes="(max-width: 1000px) 45vw, 360px"
        alt={project.cover.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  return (
    <div
      className="os-project__poster"
      style={{ '--poster-accent': project.accent } as CSSProperties}
      role="img"
      aria-label={`Typographic cover for ${project.name}: ${project.cover.alt}`}
    >
      <span className="os-project__poster-mark" aria-hidden="true">
        {project.mark}
      </span>
      <span className="os-project__poster-name" aria-hidden="true">
        {project.name}
      </span>
      <span className="os-project__poster-note" aria-hidden="true">
        No screenshot published
      </span>
    </div>
  );
}

export function ProjectGridCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  return (
    <article className={`os-project os-project--${project.category.toLowerCase()}`}>
      <AppLink className="os-project__link" href={`/projects/${project.slug}/`}>
        <span className="os-project__media">
          <ProjectMedia project={project} priority={priority} />
          <span className="os-project__category">{project.category}</span>
        </span>
        <span className="os-project__body">
          <span className="os-project__title-row">
            <span className="os-project__title">{project.name}</span>
            <ArrowUpRight className="os-project__arrow" size={15} aria-hidden="true" />
          </span>
          <span className="os-project__tagline">{project.tagline}</span>
          <span className="os-project__disclaimer">Independent project · fictional data</span>
        </span>
      </AppLink>
    </article>
  );
}

const competencyIcons = {
  cloud: Cloud,
  phone: Smartphone,
  cpu: Cpu,
  chart: LineChart,
};

export function CompetencyIcon({ icon }: { icon: keyof typeof competencyIcons }) {
  const Icon = competencyIcons[icon];
  return (
    <span className="os-competency__icon" aria-hidden="true">
      <Icon size={20} strokeWidth={1.75} />
    </span>
  );
}

export function EvidenceBadge({ children }: { children: ReactNode }) {
  return <span className="os-evidence-badge">{children}</span>;
}

export function SectionHeading({
  children,
  action,
  id,
}: {
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="os-section-head">
      <h2 id={id}>{children}</h2>
      {action ? <div className="os-section-head__action">{action}</div> : null}
    </div>
  );
}

export const osIcons = { Cloud, Cpu, FileText, LineChart, Smartphone };
