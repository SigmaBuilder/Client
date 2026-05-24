import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  Bot,
  Briefcase,
  Newspaper,
  SquareTerminal,
  Settings,
  Image,
  Book,
} from "lucide-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavModules } from "@/components/layout/nav-modules";
import { NavSecondary } from "@/components/layout/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentProject, currentSite } = useWorkspace();
  const { t } = useTranslation();
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  const enabledModules = currentSite?.features?.modules ?? {};
  const siteBaseUrl = `/dashboard/site/${currentSite?.slug}`;
  const modulesUrl = `${siteBaseUrl}/modules`;

  const data = {
    navMain: [
      {
        title: t("sidebar.home"),
        url: siteBaseUrl,
        icon: SquareTerminal,
      },
      {
        title: t("sidebar.settings"),
        url: `${siteBaseUrl}/settings`,
        icon: Settings,
      },
      {
        title: t("sidebar.modules"),
        url: modulesUrl,
        icon: Bot,
      },
      {
        title: t("sidebar.media"),
        url: `${siteBaseUrl}/media`,
        icon: Image,
      },
      {
        title: t("sidebar.pages"),
        url: `${siteBaseUrl}/pages`,
        icon: SquareTerminal,
      },
    ],
    navSecondary: [
      {
        title: t("sidebar.apiDocs"),
        url: `${siteBaseUrl}/docs`,
        icon: Book,
      },
      {
        title: t("sidebar.goToProject"),
        url: `/dashboard/${currentProject?.id}`,
        icon: Bot,
      },
    ],
    modules: [
      {
        title: t("sidebar.blog"),
        url: "#",
        icon: Newspaper,
        isActive: true,
        items: [
          {
            title: t("sidebar.posts"),
            url: `${siteBaseUrl}/blog/posts`,
          },
          {
            title: t("sidebar.categories"),
            url: `${siteBaseUrl}/blog/categories`,
          },
        ],
      },
      {
        title: t("sidebar.portfolio"),
        url: "#",
        icon: Briefcase,
        isActive: true,
        items: [
          {
            title: t("sidebar.sections"),
            url: `${siteBaseUrl}/portfolio/sections`,
          },
          {
            title: t("sidebar.projects"),
            url: `${siteBaseUrl}/portfolio/items`,
          },
          {
            title: t("sidebar.stack"),
            url: `${siteBaseUrl}/portfolio/stack`,
          },
        ],
      },
    ].filter((module) => {
      // Find the original english/spanish keys in enabledModules using module mapping
      const key = module.title === t("sidebar.blog") ? "blog" : "portfolio";
      return enabledModules[key] === true;
    }),
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
                  <span className="truncate font-medium">{t("sidebar.title")}</span>
                  <span className="truncate text-xs">{t("sidebar.subtitle")}</span>
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
