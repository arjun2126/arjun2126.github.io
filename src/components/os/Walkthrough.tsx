import { useState } from 'react';
import { walkthrough, walkthroughChapters } from '../../content/walkthrough';
import { AppLink } from '../../lib/navigation';

export function Walkthrough() {
  const [loadPlayer, setLoadPlayer] = useState(false);
  return (
    <article className="os-app os-walkthrough">
      <h1>{walkthrough.title}</h1>
      <p>{walkthrough.summary}</p>
      {walkthrough.supplied ? (
        <section aria-label="Walkthrough video">
          {!loadPlayer ? (
            <button className="os-button os-button--primary" type="button" onClick={() => setLoadPlayer(true)}>Load video from {walkthrough.provider}</button>
          ) : walkthrough.provider === 'file' ? (
            <video className="os-walkthrough__player" src={walkthrough.embedUrl!} controls playsInline preload="metadata">
              <a href={walkthrough.externalUrl}>Open recording</a>
            </video>
          ) : (
            <iframe className="os-walkthrough__player" src={walkthrough.embedUrl!} title={walkthrough.title}
              allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          )}
          <p>Loading the player connects to the external video provider. <a href={walkthrough.externalUrl} target="_blank" rel="noopener noreferrer">Open recording externally</a></p>
        </section>
      ) : (
        <section className="os-studio__fieldset"><h2>Recording not yet supplied</h2><p>A future walkthrough will use genuine application recordings. No simulated demonstration is shown.</p></section>
      )}
      <h2>Walkthrough chapters</h2>
      {walkthroughChapters.map((chapter) => <section key={chapter.title}><h3><AppLink href={chapter.href}>{chapter.title}</AppLink></h3><p>{chapter.body}</p></section>)}
    </article>
  );
}
