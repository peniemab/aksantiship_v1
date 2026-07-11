export function ProgressRing({
  value,
  size = 120,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="mx-auto flex w-full max-w-full flex-col items-center gap-2">
      <svg width={size} height={size} className="max-w-full -rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--aksanti-red)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <p className="text-2xl font-extrabold text-aksanti-red">{value}%</p>
      {label && <p className="text-center text-sm text-muted">{label}</p>}
    </div>
  );
}
