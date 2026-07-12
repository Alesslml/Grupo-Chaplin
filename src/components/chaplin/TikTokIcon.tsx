export function TikTokIcon({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.82c-1.11-.96-1.78-2.34-1.78-3.82h-3.1v14.14c0 1.53-1.24 2.77-2.77 2.77a2.77 2.77 0 0 1 0-5.54c.28 0 .55.04.8.12V10.5a5.9 5.9 0 0 0-.8-.06 5.9 5.9 0 0 0 0 11.8 5.9 5.9 0 0 0 5.9-5.9V9.01a9 9 0 0 0 5.25 1.68V7.6a5.7 5.7 0 0 1-3.5-1.78Z" />
    </svg>
  );
}
