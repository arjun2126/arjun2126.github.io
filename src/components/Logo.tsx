export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`logo-mark ${className}`.trim()}
      viewBox="0 0 40 40"
      role="img"
      aria-label="ArjunOS"
    >
      <rect width="40" height="40" rx="11" fill="var(--logo-bg, #143b35)" />
      <path
        d="M10.5 28.5 20 9.5l9.5 19M15.2 22.6h9.6"
        fill="none"
        stroke="var(--logo-ink, #e4edb0)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Monogram({
  letter = 'A',
  label = 'Arjun Subramanya',
}: {
  letter?: string;
  label?: string;
}) {
  return (
    <span className="monogram" role="img" aria-label={label}>
      {letter}
    </span>
  );
}
