import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <TooltipProvider>
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <Outlet />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
