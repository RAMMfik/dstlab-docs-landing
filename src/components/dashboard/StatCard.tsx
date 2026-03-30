type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-[rgba(10,99,117,0.08)] bg-white/80 p-5 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-600">{description}</div>
    </div>
  );
}