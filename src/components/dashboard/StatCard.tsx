export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "red" | "green";
}) {
  const valueClass =
    tone === "red"
      ? "text-aksanti-red"
      : tone === "green"
        ? "text-success"
        : "text-foreground";

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-[var(--card-shadow)]">
      <p className={`text-3xl font-extrabold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
