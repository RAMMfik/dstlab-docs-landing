type Props = {
  loading: boolean;
  children: string;
  loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function LoadingButton({
  loading,
  children,
  loadingText = "Загрузка...",
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`rounded-2xl bg-[linear-gradient(135deg,#0A6375,#1DCEC9)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${props.className || ""}`}
    >
      {loading ? loadingText : children}
    </button>
  );
}