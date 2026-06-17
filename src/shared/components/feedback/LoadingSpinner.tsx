export function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin text-brand-500"
        aria-label="Loading"
      >
        <circle
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="31.416"
          strokeDashoffset="10"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
