import * as React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Bot,
  Briefcase,
  Command,
  LifeBuoy,
  Newspaper,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavModules } from "@/components/nav-modules";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Módulos",
      url: "#",
      icon: Bot,
    },
    {
      title: "Actvidad",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Ajustes",
      url: "#",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Soporte",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Comentarios",
      url: "#",
      icon: Send,
    },
  ],
  modules: [
    {
      name: "Blog",
      url: "#",
      icon: Newspaper,
    },
    {
      name: "Portfolio",
      url: "#",
      icon: Briefcase,
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">SigmaBuilder</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavModules modules={data.modules} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
