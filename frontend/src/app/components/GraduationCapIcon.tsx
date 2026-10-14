export default function GraduationCapIcon({
  size = 24,
  className = "",
  strokeWidth = 2.2,
}: {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 10v6" />
      <path d="M2 10l10-5 10 5-10 5z" />
      <path d="M6 12.5v3.5c0 2.5 2.7 4.5 6 4.5s6-2 6-4.5v-3.5" />
    </svg>
  );
}
