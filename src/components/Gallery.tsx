import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectImage } from '../content/projects';

export function Gallery({ images, note }: { images: ProjectImage[]; note: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = selected === null ? null : images[selected];

  const close = useCallback(() => setSelected(null), []);
  const previous = useCallback(
    () => setSelected((index) => (index === null ? null : (index - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setSelected((index) => (index === null ? null : (index + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected !== null && !dialog.open) dialog.showModal();
    if (selected === null && dialog.open) dialog.close();
  }, [selected]);

  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selected, previous, next]);

  if (images.length === 0) return null;

  return (
    <div className="gallery-block">
      <div className="gallery" role="group" aria-label="Project screenshots">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            className={`gallery__item${image.tall ? ' gallery__item--tall' : ''}`}
            onClick={() => setSelected(index)}
            aria-label={`Open screenshot ${index + 1} of ${images.length}: ${image.caption}`}
          >
            <span className="gallery__frame">
              <img
                src={image.src}
                srcSet={image.thumb ? `${image.thumb} 800w, ${image.src} 1600w` : undefined}
                sizes="(max-width: 620px) calc(100vw - 56px), 380px"
                alt={image.alt}
                loading="lazy"
                decoding="async"
              />
              <span className="gallery__expand" aria-hidden="true">
                <Expand size={15} />
              </span>
            </span>
            <span className="gallery__caption">{image.caption}</span>
          </button>
        ))}
      </div>
      <p className="source-note">{note}</p>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label="Project screenshot viewer"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        {current ? (
          <div className="lightbox__inner">
            <div className="lightbox__bar">
              <span>
                {selected! + 1} / {images.length}
              </span>
              <button type="button" className="lightbox__close" onClick={close} aria-label="Close image viewer">
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <figure>
              <img src={current.src} alt={current.alt} />
              <figcaption>{current.caption}</figcaption>
            </figure>
            <div className="lightbox__controls">
              <button type="button" onClick={previous} aria-label="Previous screenshot">
                <ArrowLeft size={18} aria-hidden="true" />
                <span>Previous</span>
              </button>
              <button type="button" onClick={next} aria-label="Next screenshot">
                <span>Next</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
