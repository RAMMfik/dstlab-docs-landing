import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/documents");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8FBFC_0%,#F3F8F8_100%)]">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}