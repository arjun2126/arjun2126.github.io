import { ArrowLeft, FileText } from 'lucide-react';
import { AppLink } from '../lib/navigation';

export function NotFoundContent({ path }: { path: string }) {
  return (
    <div className="notfound">
      <span className="notfound__code" aria-hidden="true">
        404
      </span>
      <span className="eyebrow">Route not found</span>
      <h1>That window doesn’t exist.</h1>
      <p>
        The address <code>{path}</code> is not part of ArjunOS. The project browser is still open.
      </p>
      <div className="notfound__actions">
        <AppLink className="button button--primary" href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to projects
        </AppLink>
        <AppLink className="button button--quiet" href="/resume/">
          <FileText size={16} aria-hidden="true" />
          View résumé
        </AppLink>
      </div>
    </div>
  );
}
