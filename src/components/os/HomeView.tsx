import { ArrowRight, ArrowUpRight, Award, IdCard, Rocket, ShieldCheck } from 'lucide-react';
import type { CSSProperties } from 'react';
import {
  certificationStatus,
  certificationVerification,
  publicCertifications,
} from '../../content/certifications';
import { competencies, hero } from '../../content/expertise';
import { profile } from '../../content/profile';
import { featuredProjects } from '../../content/projects';
import { AppLink } from '../../lib/navigation';
import {
  CompetencyIcon,
  Portrait,
  ProjectGridCard,
  SectionHeading,
} from './parts';

export function HomeView() {
  return (
    <div className="os-home">
      <section className="os-hero" aria-labelledby="os-welcome">
        <div className="os-hero__scene" aria-hidden="true">
          <img src="/wallpaper-alpine.webp" alt="" width="2400" height="1573" decoding="async" />
        </div>
        <div className="os-hero__copy">
          <p className="os-hero__eyebrow">{hero.eyebrow}</p>
          <h1
            className="os-hero__title"
            id="os-welcome"
            aria-label={`Hi, I'm ${profile.name}.`}
          >
            <span className="os-hero__greeting" aria-hidden="true">
              {hero.greeting}
            </span>
            <span className="os-hero__name" aria-hidden="true">
              {profile.name}.
            </span>
          </h1>
          <p className="os-hero__headline">{hero.headline}</p>
          <p className="os-hero__statement">{profile.headline}</p>
          <p className="os-hero__intro">{profile.intro}</p>
          <div className="os-hero__actions">
            <AppLink className="os-button os-button--primary" href={hero.primaryAction.href}>
              <Rocket size={15} aria-hidden="true" />
              {hero.primaryAction.label}
            </AppLink>
            <AppLink className="os-button os-button--glass" href={hero.secondaryAction.href}>
              <IdCard size={15} aria-hidden="true" />
              {hero.secondaryAction.label}
            </AppLink>
          </div>
        </div>
        <div className="os-hero__portrait">
          <Portrait />
        </div>
      </section>

      <section className="os-competencies" aria-label="Core capabilities">
        {competencies.map((competency) => (
          <AppLink
            key={competency.id}
            href={competency.href}
            className={`os-competency os-competency--${competency.id}`}
            style={{ '--competency-accent': competency.accent } as CSSProperties}
          >
            <span className="os-competency__top">
              <CompetencyIcon icon={competency.icon} />
              <ArrowUpRight className="os-competency__arrow" size={14} aria-hidden="true" />
            </span>
            <span className="os-competency__title">{competency.title}</span>
            <span className="os-competency__blurb">{competency.blurb}</span>
            <span className="os-competency__items">{competency.items.join(' · ')}</span>
          </AppLink>
        ))}
      </section>

      <section className="os-credentials" aria-labelledby="os-credentials-title">
        <SectionHeading
          id="os-credentials-title"
          action={
            <AppLink className="os-text-link" href="/certifications/">
              Open credential gallery
              <ArrowRight size={14} aria-hidden="true" />
            </AppLink>
          }
        >
          Certifications
        </SectionHeading>
        <div className="os-credentials__grid">
          {publicCertifications.map((certification) => {
            const status = certificationStatus(certification);
            const verification = certificationVerification(certification);
            return (
              <AppLink
                key={certification.id}
                className="os-credential"
                href="/certifications/"
              >
                <span className="os-credential__top">
                  <span className="os-credential__badge" aria-hidden="true">
                    <Award size={17} strokeWidth={1.7} />
                  </span>
                  {verification ? (
                    <>
                      <ShieldCheck
                        className="os-credential__verified"
                        size={14}
                        aria-hidden="true"
                      />
                      <span className="sr-only">Official verification link published.</span>
                    </>
                  ) : (
                    <ArrowUpRight
                      className="os-credential__arrow"
                      size={13}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="os-credential__name">{certification.name}</span>
                <span className="os-credential__meta">
                  {certification.issuer} · {status.label}
                </span>
              </AppLink>
            );
          })}
        </div>
        <p className="os-credentials__note">
          {publicCertifications.length} approved Salesforce credential
          {publicCertifications.length === 1 ? '' : 's'} and their issuer. Sanitized previews are
          available in the gallery; dates, verification links and credential IDs are not published.
        </p>
      </section>

      <section className="os-featured" aria-labelledby="os-featured-title">
        <SectionHeading
          id="os-featured-title"
          action={
            <AppLink className="os-text-link" href="/projects/">
              View All Projects
              <ArrowRight size={14} aria-hidden="true" />
            </AppLink>
          }
        >
          Featured Projects
        </SectionHeading>
        <div className="os-featured__grid">
          {featuredProjects.map((project, index) => (
            <ProjectGridCard key={project.slug} project={project} priority={index < 2} />
          ))}
        </div>
      </section>
    </div>
  );
}
