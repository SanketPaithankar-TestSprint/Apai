import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { DashboardContent } from "@/components/dashboard-content";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { AuthGuard } from "@/components/auth-guard";

export function DashboardLayout() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <Header />
        <div className="flex min-h-screen bg-background pt-16">
          <Sidebar />
          <DashboardContent>
            <Outlet />
          </DashboardContent>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

