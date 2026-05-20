import * as React from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  Bot,
  Briefcase,
  Newspaper,
  Send,
  SquareTerminal,
  Settings,
  Image,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentProject, currentSite } = useWorkspace();
  const enabledModules = currentSite?.features?.modules ?? {};
  const siteBaseUrl = `/dashboard/site/${currentSite?.slug}`;
  const modulesUrl = `${siteBaseUrl}/modules`;

  const data = {
    navMain: [
      {
        title: "Inicio",
        url: siteBaseUrl,
        icon: SquareTerminal,
      },
      {
        title: "Ajustes del sitio",
        url: `${siteBaseUrl}/settings`,
        icon: Settings,
      },
      {
        title: "Módulos",
        url: modulesUrl,
        icon: Bot,
      },
      {
        title: "Libreria de Medios",
        url: `${siteBaseUrl}/media`,
        icon: Image,
      },
      {
        title: "Editor de páginas",
        url: `${siteBaseUrl}/pages`,
        icon: SquareTerminal,
      },
    ],
    navSecondary: [
      {
        title: "Comentarios",
        url: "https://github.com/SigmaBuilder/Client/issues/new",
        icon: Send,
      },
      {
        title: "Ir al proyecto",
        url: `/dashboard/${currentProject?.id}`,
        icon: Bot,
      },
    ],
    modules: [
      {
        title: "Blog",
        url: "#",
        icon: Newspaper,
        isActive: true,
        items: [
          {
            title: "Posts",
            url: `${siteBaseUrl}/blog/posts`,
          },
          {
            title: "Categorías",
            url: `${siteBaseUrl}/blog/categories`,
          },
        ],
      },
      {
        title: "Portfolio",
        url: "#",
        icon: Briefcase,
        isActive: true,
        items: [
          {
            title: "Secciones",
            url: `${siteBaseUrl}/portfolio/sections`,
          },
          {
            title: "Proyectos",
            url: `${siteBaseUrl}/portfolio/items`,
          },
          {
            title: "Stack",
            url: `${siteBaseUrl}/portfolio/stack`,
          },
        ],
      },
    ].filter((module) => enabledModules[module.title.toLowerCase()] === true),
  };
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
                <img
                  src="/dark-icon.svg"
                  alt="SigmaBuilder Logo"
                  className="dark:hidden flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground"
                />
                <img
                  src="/icon.svg"
                  alt="SigmaBuilder Logo"
                  className="hidden dark:flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground"
                />
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
        <NavModules items={data.modules} manageUrl={modulesUrl} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
      </SidebarFooter>
    </Sidebar>
  );
}
