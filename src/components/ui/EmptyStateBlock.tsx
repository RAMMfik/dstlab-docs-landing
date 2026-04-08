type Props = {
  children: string;
};

export function EmptyStateBlock({ children }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      {children}
    </div>
  );
}