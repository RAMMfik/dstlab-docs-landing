import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8FBFC_0%,#F3F8F8_100%)]">
      <div className="container py-6 sm:py-8">
        <DashboardHeader />

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <DashboardSidebar />
          <section>{children}</section>
        </div>
      </div>
    </main>
  );
}