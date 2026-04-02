type TariffCardProps = {
  name: string;
  used: number;
  limit: number;
  label: string;
};

function Progress({ used, limit }: { used: number; limit: number }) {
  const percent = Math.min((used / limit) * 100, 100);

  return (
    <div className="mt-2">
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-[linear-gradient(135deg,#0A6375,#1DCEC9)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function TariffCard({
  name,
  used,
  limit,
  label,
}: TariffCardProps) {
  return (
    <div className="rounded-[28px] border border-[rgba(10,99,117,0.08)] bg-white/80 p-6 shadow-[0_10px_30px_rgba(10,99,117,0.06)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Тариф</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {name}
          </div>
        </div>

        <a
          href="/billing"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Изменить
        </a>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm">
            <span>{label}</span>
            <span className="font-semibold">
              {used} / {limit}
            </span>
          </div>
          <Progress used={used} limit={limit} />
        </div>
      </div>
    </div>
  );
}