import { Check, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';

interface RedactionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function boxFromPoints(a: { x: number; y: number }, b: { x: number; y: number }): RedactionBox {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

/**
 * Burn opaque redaction boxes into a local image copy before it is saved.
 * The exported JPEG replaces the draft asset, so the public file cannot reveal
 * the area underneath. PDFs are redacted externally and validated on save.
 */
export function ImageRedactor({
  src,
  name,
  onCancel,
  onApply,
}: {
  src: string;
  name: string;
  onCancel: () => void;
  onApply: (dataUrl: string, count: number) => void;
}) {
  const baseId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const cancelAction = useRef(onCancel);
  cancelAction.current = onCancel;
  const [boxes, setBoxes] = useState<RedactionBox[]>([]);
  const [draft, setDraft] = useState<RedactionBox | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [manual, setManual] = useState({ x: '10', y: '10', width: '30', height: '8' });

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const root = document.getElementById('root');
    document.body.style.overflow = 'hidden';
    root?.setAttribute('inert', '');
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelAction.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      root?.removeAttribute('inert');
      previous?.focus();
    };
  }, []);

  const point = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const start = point(event);
    startRef.current = start;
    setDraft({ x: start.x, y: start.y, width: 0, height: 0 });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    setDraft(boxFromPoints(startRef.current, point(event)));
  };

  const onPointerUp = () => {
    if (draft && draft.width > 0.01 && draft.height > 0.005) {
      setBoxes((current) => [...current, draft]);
    }
    startRef.current = null;
    setDraft(null);
  };

  const addManualBox = () => {
    const values = {
      x: Number(manual.x) / 100,
      y: Number(manual.y) / 100,
      width: Number(manual.width) / 100,
      height: Number(manual.height) / 100,
    };
    if (
      !Number.isFinite(values.x) ||
      !Number.isFinite(values.y) ||
      values.width <= 0 ||
      values.height <= 0 ||
      values.x + values.width > 1.0001 ||
      values.y + values.height > 1.0001
    ) {
      setError('Use percentages within the image; width and height must be greater than zero.');
      return;
    }
    setError('');
    setBoxes((current) => [...current, values]);
  };

  const apply = () => {
    const image = imageRef.current;
    if (!image || !boxes.length) return;
    if (!image.naturalWidth || !image.naturalHeight) {
      setError('The image has not finished loading.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Canvas is unavailable in this browser.');
      return;
    }
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    for (const box of boxes) {
      context.fillRect(
        Math.round(box.x * canvas.width),
        Math.round(box.y * canvas.height),
        Math.max(1, Math.round(box.width * canvas.width)),
        Math.max(1, Math.round(box.height * canvas.height)),
      );
    }
    try {
      onApply(canvas.toDataURL('image/jpeg', 0.92), boxes.length);
    } catch {
      setError('This image could not be exported, usually because it is not same-origin.');
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="os-redactor"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className="os-redactor__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        aria-describedby={`${baseId}-hint`}
        tabIndex={-1}
      >
        <header className="os-redactor__head">
          <div>
            <p className="os-redactor__eyebrow">Local redaction</p>
            <h2 id={`${baseId}-title`}>Redact {name || 'certificate'} image</h2>
            <p id={`${baseId}-hint`}>
              Drag on the image or add a percentage box. Applying burns black boxes into a new
              JPEG copy and holds that copy privately until you publish it.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="os-redactor__close"
            aria-label="Close redaction editor"
            onClick={onCancel}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="os-redactor__body">
          <div className="os-redactor__stage">
            <div className="os-redactor__canvas">
              <img
                ref={imageRef}
                src={src}
                alt={`Certificate image being redacted for ${name}`}
                onLoad={() => setReady(true)}
                onError={() => setError('The image could not be loaded for redaction.')}
              />
              <div
                ref={overlayRef}
                className="os-redactor__overlay"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {boxes.map((box, index) => (
                  <span
                    key={`${box.x}-${box.y}-${index}`}
                    className="os-redactor__box"
                    style={{
                      left: `${box.x * 100}%`,
                      top: `${box.y * 100}%`,
                      width: `${box.width * 100}%`,
                      height: `${box.height * 100}%`,
                    }}
                  />
                ))}
                {draft ? (
                  <span
                    className="os-redactor__box os-redactor__box--draft"
                    style={{
                      left: `${draft.x * 100}%`,
                      top: `${draft.y * 100}%`,
                      width: `${draft.width * 100}%`,
                      height: `${draft.height * 100}%`,
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>

          <aside className="os-redactor__aside">
            <h3>Redaction boxes</h3>
            {boxes.length ? (
              <ul>
                {boxes.map((box, index) => (
                  <li key={`${box.x}-${box.y}-${index}`}>
                    <span>
                      {Math.round(box.x * 100)}% / {Math.round(box.y * 100)}% ·{' '}
                      {Math.round(box.width * 100)}% × {Math.round(box.height * 100)}%
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove redaction box ${index + 1}`}
                      onClick={() => setBoxes((current) => current.filter((_, item) => item !== index))}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No boxes yet. Draw over a credential ID, verification code or private detail.</p>
            )}

            <fieldset>
              <legend>Add a box by percentage</legend>
              <div className="os-redactor__grid">
                {(['x', 'y', 'width', 'height'] as const).map((field) => (
                  <label key={field}>
                    {field}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={manual[field]}
                      onChange={(event) =>
                        setManual((current) => ({ ...current, [field]: event.target.value }))
                      }
                    />
                  </label>
                ))}
              </div>
              <button type="button" className="os-button os-button--quiet" onClick={addManualBox}>
                <Plus size={14} aria-hidden="true" /> Add box
              </button>
            </fieldset>

            <div className="os-redactor__aside-actions">
              <button
                type="button"
                className="os-text-button"
                onClick={() => setBoxes((current) => current.slice(0, -1))}
                disabled={!boxes.length}
              >
                <RotateCcw size={12} aria-hidden="true" /> Undo last
              </button>
              <button
                type="button"
                className="os-text-button"
                onClick={() => setBoxes([])}
                disabled={!boxes.length}
              >
                Clear all
              </button>
            </div>
            {error ? <p className="os-redactor__error">{error}</p> : null}
          </aside>
        </div>

        <footer className="os-redactor__footer">
          <p>
            PDFs cannot be redacted here. Export a sanitized PDF and upload that instead.
          </p>
          <div>
            <button type="button" className="os-button os-button--quiet" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="os-button os-button--primary"
              onClick={apply}
              disabled={!ready || boxes.length === 0}
            >
              <Check size={15} aria-hidden="true" /> Apply redactions
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
