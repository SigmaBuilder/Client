import * as React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Bot,
  Briefcase,
  LifeBuoy,
  Newspaper,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavModules } from "@/components/nav-modules";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
                <img src="/dark-icon.svg" alt="SigmaBuilder Logo" className="dark:hidden flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground" />
                <img src="/icon.svg" alt="SigmaBuilder Logo" className="hidden dark:flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">SigmaBuilder</span>
                  <span className="truncate text-xs">Panel de control</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavModules modules={data.modules} />
        
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
      </SidebarFooter>
    </Sidebar>
  );
}
