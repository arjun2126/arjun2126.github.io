import {
  ArrowUpRight,
  Expand,
  LoaderCircle,
  LockKeyhole,
  MonitorPlay,
  ShieldAlert,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  northgateLive,
  northgateLiveHome,
  type NorthgateLiveView,
} from '../../content/northgateLive';

export function NorthgateLive({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [active, setActive] = useState<NorthgateLiveView['id']>('home');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const previewRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const view = northgateLive.views.find((item) => item.id === active) ?? northgateLive.views[0];

  useEffect(() => {
    setImageLoaded(false);
    const image = imageRef.current;
    // A cached capture can finish before React attaches onLoad; treat an
    // already-complete image as ready so the loading layer cannot stick.
    if (image?.complete && image.naturalWidth > 0) setImageLoaded(true);
  }, [active]);

  const openFullscreen = async () => {
    const element = previewRef.current;
    if (!element || !element.requestFullscreen) {
      setFullscreenError('Full-screen preview is unavailable in this browser.');
      return;
    }
    try {
      await element.requestFullscreen();
      setFullscreenError('');
    } catch {
      setFullscreenError('The browser refused full-screen mode. Use Open Original Website instead.');
    }
  };

  return (
    <div className={`os-app os-live os-live--${tone}${tone === 'light' ? ' os-app--light' : ''}`}>
      <header className="os-live__header">
        <div className="os-live__heading">
          <p className="os-live__eyebrow">
            <MonitorPlay size={13} aria-hidden="true" /> Live buyer experience
          </p>
          <h1>Northgate Motors, live.</h1>
          <p className="os-live__lede">
            The actual Salesforce Experience Cloud buyer site, published from the Northgate demo
            org. Explore the six guest routes without an account. Everything shown there is
            fictional demo data.
          </p>
        </div>
        <div className="os-live__status" aria-label="Live site verification">
          <span className="os-live__status-dot" aria-hidden="true" />
          <span>
            Site verified · {northgateLive.verifiedAt}
            <small>{new URL(northgateLive.origin).host}</small>
          </span>
        </div>
      </header>

      <div className="os-live__notice" role="note">
        <ShieldAlert size={18} aria-hidden="true" />
        <div>
          <strong>Embedded framing is blocked by Salesforce.</strong>
          <p>
            {northgateLive.framing.summary} ArjunOS does not proxy the application or weaken
            Salesforce security. This window shows genuine captures; the live site opens in a new
            tab.
          </p>
          <details>
            <summary>Framing evidence and proposed change</summary>
            <ul>
              <li>
                <code>X-Frame-Options: {northgateLive.framing.xFrameOptions}</code>
              </li>
              <li>
                <code>Content-Security-Policy: {northgateLive.framing.csp}</code>
              </li>
              <li>
                Checked <code>{northgateLive.framing.checkedUrl}</code> on{' '}
                {northgateLive.verifiedAt}.
              </li>
              <li>
                {northgateLive.proposal} Owner approval is required before any Salesforce security
                or trusted-domain change.
              </li>
              <li>The authenticated Owner Portal is deliberately excluded from this window.</li>
            </ul>
          </details>
        </div>
      </div>

      <nav className="os-live__tabs" aria-label="Northgate buyer pages">
        {northgateLive.views.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`os-live__tab${active === item.id ? ' is-active' : ''}`}
            aria-pressed={active === item.id}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <figure className="os-live__preview" ref={previewRef}>
        <div className="os-live__browserbar">
          <span className="os-live__lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="os-live__url">
            <LockKeyhole size={11} aria-hidden="true" />
            {view.pathLabel}
          </span>
          <span className="os-live__browser-actions">
            <button
              type="button"
              onClick={() => void openFullscreen()}
              aria-label="Expand screenshot preview to full screen"
            >
              <Expand size={13} aria-hidden="true" />
              Expand
            </button>
            <a href={view.url} target="_blank" rel="noreferrer noopener">
              Open Original Website
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </span>
        </div>

        <div className="os-live__stage">
          {!imageLoaded ? (
            <div className="os-live__loading" role="status" aria-live="polite">
              <LoaderCircle size={22} aria-hidden="true" />
              Loading genuine screenshot…
            </div>
          ) : null}
          <img
            key={view.src}
            ref={imageRef}
            src={view.src}
            srcSet={`${view.thumb} 800w, ${view.src} 1600w`}
            sizes="(max-width: 900px) 92vw, 1040px"
            alt={view.alt}
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          <span className="os-live__stamp">Verified capture · not the embedded site</span>
        </div>

        <figcaption className="os-live__caption">
          <span>{view.caption}</span>
          <span>{view.pathLabel}</span>
        </figcaption>
      </figure>

      {fullscreenError ? (
        <p className="os-live__error" role="alert">
          {fullscreenError}
        </p>
      ) : null}

      <footer className="os-live__footer">
        <div>
          <h2>Explore the actual buyer experience</h2>
          <p>
            You are viewing an owner-published screenshot, not a live frame. The original site
            opens at the exact buyer route in a new tab. The authenticated Owner Portal and all
            administrative routes are excluded.
          </p>
          <p className="os-live__privacy">
            No credentials, session data, private records or Salesforce tokens are requested or
            stored by ArjunOS.
          </p>
        </div>
        <div className="os-live__actions">
          <a
            className="os-button os-button--primary"
            href={northgateLiveHome.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open the live buyer site
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a
            className="os-button os-button--quiet"
            href={northgateLive.views[1].url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open inventory
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a
            className="os-button os-button--quiet"
            href={northgateLive.views[2].url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open 3D Studio
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
