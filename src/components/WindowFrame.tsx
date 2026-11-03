import { Minus, Plus, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type { Rect, WindowState } from '../lib/windows';

interface WindowFrameProps {
  win: WindowState;
  title: string;
  subtitle?: string;
  plain?: boolean;
  active: boolean;
  autoFocus?: boolean;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (rect: Rect) => void;
}

interface DragStart {
  pointerId: number;
  startX: number;
  startY: number;
  rect: Rect;
}

export function WindowFrame({
  win,
  title,
  subtitle,
  plain = false,
  active,
  autoFocus = false,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
}: WindowFrameProps) {
  const frameRef = useRef<HTMLElement>(null);
  const dragRef = useRef<DragStart | null>(null);
  const latestRect = useRef<Rect | null>(null);
  const [dragRect, setDragRect] = useState<Rect | null>(null);
  const [dragging, setDragging] = useState(false);
  const titleId = `window-title-${win.id.replace(/[^a-z0-9-]/gi, '-')}`;
  const rect = dragRect ?? win.rect;

  useEffect(() => {
    if (autoFocus && !win.minimized) frameRef.current?.focus({ preventScroll: true });
  }, [autoFocus, win.minimized]);

  const beginDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (win.maximized) return;
    if ((event.target as HTMLElement).closest('button, a, input, select, textarea, [data-no-drag]')) return;
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rect: win.rect,
    };
    latestRect.current = win.rect;
    setDragging(true);
    onFocus();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const start = dragRef.current;
    if (!start) return;
    const stage = frameRef.current?.parentElement?.getBoundingClientRect();
    if (!stage) return;
    const nextX = Math.min(
      Math.max(start.rect.x + event.clientX - start.startX, 48 - start.rect.width * 0.72),
      stage.width - 180,
    );
    const nextY = Math.min(
      Math.max(start.rect.y + event.clientY - start.startY, 0),
      stage.height - 54,
    );
    const next = { ...start.rect, x: Math.round(nextX), y: Math.round(nextY) };
    latestRect.current = next;
    setDragRect(next);
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    if (latestRect.current) onMove(latestRect.current);
    setDragRect(null);
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      // The pointer may already have been released by the browser.
    }
  };

  return (
    <section
      ref={frameRef}
      className={[
        'window',
        plain ? 'window--plain' : 'window--titled',
        `window--${win.kind}`,
        active ? 'is-active' : '',
        win.maximized ? 'is-maximized' : '',
        win.minimized ? 'is-minimized' : '',
        dragging ? 'is-dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex: win.z,
      }}
      role="dialog"
      aria-modal="false"
      aria-labelledby={plain ? undefined : titleId}
      aria-label={plain ? 'ArjunOS desktop window' : undefined}
      aria-hidden={win.minimized ? 'true' : undefined}
      inert={win.minimized || undefined}
      tabIndex={-1}
      onPointerDown={onFocus}
      data-window={win.id}
    >
      <header
        className="window__bar"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(event) => {
          if ((event.target as HTMLElement).closest('button')) return;
          onMaximize();
        }}
      >
        <div className="traffic">
          <button
            type="button"
            className="traffic__button traffic__button--close"
            onClick={onClose}
            aria-label={`Close ${title}`}
            title="Close"
          >
            <X size={8} strokeWidth={2.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="traffic__button traffic__button--minimize"
            onClick={onMinimize}
            aria-label={`Minimize ${title}`}
            title="Minimize"
          >
            <Minus size={8} strokeWidth={2.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="traffic__button traffic__button--maximize"
            onClick={onMaximize}
            aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${title}`}
            title={win.maximized ? 'Restore' : 'Maximize'}
          >
            <Plus size={8} strokeWidth={2.6} aria-hidden="true" />
          </button>
        </div>

        {plain ? (
          <div className="window__plain-spacer" />
        ) : (
          <div className="window__title-group">
            <span className="window__title" id={titleId}>
              {title}
            </span>
            {subtitle ? <span className="window__subtitle">{subtitle}</span> : null}
          </div>
        )}

      </header>
      <div className="window__body">{children}</div>
    </section>
  );
}
