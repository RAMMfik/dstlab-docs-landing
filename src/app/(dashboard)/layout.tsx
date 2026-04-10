import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { getCurrentUser } from "@/lib/auth";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = getAdminEmails().includes(user.email.toLowerCase());

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8FBFC_0%,#F3F8F8_100%)]">
      <div className="container py-6 sm:py-8">
        <DashboardHeader
          email={user.email}
          plan={user.plan}
          subscriptionStatus={user.subscriptionStatus}
          isAdmin={isAdmin}
        />

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <DashboardSidebar isAdmin={isAdmin} />
          <section>{children}</section>
        </div>
      </div>
    </main>
  );
}