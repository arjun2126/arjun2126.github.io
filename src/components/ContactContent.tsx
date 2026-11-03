import { ArrowUpRight, Check, Copy, Github, Linkedin, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';

export function ContactContent({ mode = 'window' }: { mode?: 'window' | 'document' }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyGitHub = async () => {
    try {
      await navigator.clipboard.writeText(profile.github);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopyState('idle'), 2400);
  };

  return (
    <div className={`contact-content contact-content--${mode}`}>
      <header className="contact-hero">
        <span className="eyebrow">Contact</span>
        <h1>
          Let’s talk about
          <br />
          <em>the work.</em>
        </h1>
        <p>{profile.contactIntro}</p>
        <p className="contact-location">
          <MapPin size={14} aria-hidden="true" /> {profile.location}
        </p>
      </header>

      <div className="contact-grid">
        <a className="contact-card contact-card--primary" href={profile.github} target="_blank" rel="noreferrer noopener">
          <span className="contact-card__icon">
            <Github size={24} aria-hidden="true" />
          </span>
          <span className="contact-card__label">Primary route</span>
          <h2>GitHub</h2>
          <span className="contact-card__handle">github.com/arjun2126</span>
          <span className="contact-card__arrow">
            <ArrowUpRight size={19} aria-hidden="true" />
          </span>
        </a>

        <a className="contact-card" href={profile.linkedin} target="_blank" rel="noreferrer noopener">
          <span className="contact-card__icon">
            <Linkedin size={24} aria-hidden="true" />
          </span>
          <span className="contact-card__label">Professional network</span>
          <h2>LinkedIn</h2>
          <span className="contact-card__handle">linkedin.com/in/arjunsubra</span>
          <span className="contact-card__arrow">
            <ArrowUpRight size={19} aria-hidden="true" />
          </span>
        </a>
      </div>

      <div className="contact-copy">
        <div>
          <strong>Copy the GitHub URL</strong>
          <p>Useful if you are composing a message elsewhere.</p>
        </div>
        <button type="button" className="button button--quiet button--small" onClick={copyGitHub}>
          {copyState === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copyState === 'copied' ? 'Copied' : 'Copy profile URL'}
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {copyState === 'copied' ? 'GitHub profile URL copied to clipboard.' : ''}
          {copyState === 'failed' ? 'Clipboard access was unavailable.' : ''}
        </span>
      </div>

      <section className="contact-projects" aria-labelledby="contact-projects-heading">
        <div className="section-title-row">
          <h2 id="contact-projects-heading">Repositories</h2>
          <span>{profile.repoList.length} public</span>
        </div>
        <div className="contact-repo-grid">
          {profile.repoList.map((repo, index) => (
            <a href={repo.url} target="_blank" rel="noreferrer noopener" key={repo.url} className="contact-repo">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{repo.name}</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <p className="contact-note">{profile.contactNote}</p>

      <footer className="contact-footer">
        <span>{profile.name}</span>
        <span>{profile.disciplines}</span>
      </footer>
    </div>
  );
}
