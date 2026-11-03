import { Cloud, Layers, ShieldCheck, Terminal } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { salesforceTabs } from '../../content/expertise';
import { projectBySlug } from '../../content/projects';
import { AppLink } from '../../lib/navigation';
import { Wallpaper } from './parts';

export function SalesforceView({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [active, setActive] = useState('overview');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const current = salesforceTabs.find((tab) => tab.id === active) ?? salesforceTabs[0];

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % salesforceTabs.length;
    if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + salesforceTabs.length) % salesforceTabs.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = salesforceTabs.length - 1;
    const next = salesforceTabs[nextIndex];
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div className={`os-app os-sf os-sf--${tone}${tone === 'light' ? ' os-app--light' : ''}`}>
      <header className="os-sf__header">
        <span className="os-sf__glyph" aria-hidden="true">
          <Cloud size={22} strokeWidth={1.7} />
        </span>
        <div>
          <h2>Salesforce Workspace</h2>
          <p>Salesforce Development Portfolio</p>
        </div>
        <span className="os-sf__badge">Public demos</span>
      </header>

      <div className="os-sf__tabs" role="tablist" aria-label="Salesforce workspace sections">
        {salesforceTabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[tab.id] = element;
            }}
            type="button"
            role="tab"
            id={`sf-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`sf-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className={`os-sf__tab${active === tab.id ? ' is-active' : ''}`}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="os-sf__panel"
        role="tabpanel"
        id={`sf-panel-${current.id}`}
        aria-labelledby={`sf-tab-${current.id}`}
        tabIndex={0}
      >
        {current.id === 'overview' ? (
          <div className="os-sf__illustration">
            <Wallpaper />
            <div className="os-sf__cloud">
              <Cloud size={30} strokeWidth={1.5} aria-hidden="true" />
              <span>Salesforce demos</span>
            </div>
            <div className="os-sf__tiles">
              <AppLink href="/resume/" className="os-sf__tile">
                <span className="os-sf__tile-icon" aria-hidden="true">
                  <Terminal size={18} />
                </span>
                Developer Profile
              </AppLink>
              <AppLink href="/projects/" className="os-sf__tile">
                <span className="os-sf__tile-icon" aria-hidden="true">
                  <Layers size={18} />
                </span>
                Salesforce Projects
              </AppLink>
              <button
                type="button"
                className="os-sf__tile"
                onClick={() => setActive('architecture')}
              >
                <span className="os-sf__tile-icon" aria-hidden="true">
                  <Cloud size={18} />
                </span>
                Architecture
              </button>
              <button
                type="button"
                className="os-sf__tile"
                onClick={() => setActive('testing')}
              >
                <span className="os-sf__tile-icon" aria-hidden="true">
                  <ShieldCheck size={18} />
                </span>
                Testing &amp; Deploy
              </button>
            </div>
          </div>
        ) : null}

        <div className="os-sf__content">
          <h2>{current.heading}</h2>
          <p>{current.summary}</p>
          <ul>
            {current.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className="os-sf__projects">
            {current.projects.map((slug) => {
              const project = projectBySlug[slug];
              return project ? (
                <AppLink key={slug} href={`/projects/${slug}/`} className="os-sf__project">
                  <span>{project.name}</span>
                  <span>{project.category}</span>
                </AppLink>
              ) : null;
            })}
          </div>
          <p className="os-sf__note">
            Independent simulations built on Salesforce. Not affiliated with or endorsed by
            Salesforce, Inc. Evidence is quoted from public repositories.
          </p>
        </div>
      </div>
    </div>
  );
}
