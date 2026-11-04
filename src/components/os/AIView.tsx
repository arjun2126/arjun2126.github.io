import { ArrowUpRight, FlaskConical, ShieldCheck } from 'lucide-react';
import { aiCategories, type EvidenceLevel } from '../../content/expertise';
import { aiPositioning } from '../../content/professional';
import { AppLink } from '../../lib/navigation';

const levelLabels: Record<EvidenceLevel, string> = {
  applied: 'Applied here',
  experimental: 'Experimental',
  planned: 'Planned',
};

export function AIView({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <div className={`os-app os-ai os-ai--${tone}${tone === 'light' ? ' os-app--light' : ''}`}>
      <header className="os-ai__header">
        <p className="os-ai__eyebrow">AI Engineering</p>
        <h1>AI-assisted engineering with visible review gates.</h1>
        <p className="os-ai__lede">
          {aiPositioning.summary}
        </p>
      </header>

      <div className="os-ai__grid">
        {aiCategories.map((category) => (
          <section className="os-ai__card" key={category.id} aria-labelledby={`ai-${category.id}`}>
            <h2 id={`ai-${category.id}`}>{category.title}</h2>
            <p className="os-ai__description">{category.description}</p>
            <ul className="os-ai__items">
              {category.items.map((item) => (
                <li key={item.name}>
                  <div className="os-ai__item-head">
                    <strong>{item.name}</strong>
                    <span className={`os-level os-level--${item.level}`}>
                      {levelLabels[item.level]}
                    </span>
                  </div>
                  <p>{item.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="os-ai__footer">
        <div>
          <ShieldCheck size={17} aria-hidden="true" />
          <p>
            Agents can draft and validate, but deployment, credential changes and destructive
            actions still need my approval.
          </p>
        </div>
        <div>
          <FlaskConical size={17} aria-hidden="true" />
          <p>
            Evidence: this portfolio’s AGENTS.md and PLANS.md harness, plus the public{' '}
            <a
              href="https://github.com/arjun2126/agentic-job-search-workflow"
              target="_blank"
              rel="noreferrer noopener"
            >
              agentic job search workflow
            </a>{' '}
            repository. MCP and orchestration are labelled experimental.
          </p>
        </div>
        <div className="os-ai__limits">
          <p>
            <strong>What I have not done.</strong> {aiPositioning.closing}
          </p>
          <ul>
            {aiPositioning.nonClaims.map((claim) => (
              <li key={claim}>{claim}</li>
            ))}
          </ul>
        </div>
        <AppLink href="/about/" className="os-text-link">
          How this portfolio was built <ArrowUpRight size={14} aria-hidden="true" />
        </AppLink>
      </footer>
    </div>
  );
}
