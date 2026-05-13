import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { useWorkspace } from "@/hooks/use-workspace";

type Crumb =
  | { type: "link"; label: string; to: string }
  | { type: "page"; label: string };

function useBreadcrumbs(): Crumb[] {
  const location = useLocation();
  const { currentProject, currentSite } = useWorkspace();
  const { pathname } = location;

  // /dashboard/site/:slug
  if (pathname.startsWith("/dashboard/site/")) {
    const crumbs: Crumb[] = [
      { type: "link", label: "Proyectos", to: "/dashboard" },
    ];
    if (currentProject) {
      crumbs.push({
        type: "link",
        label: currentProject.name,
        to: `/dashboard/${currentProject.id}`,
      });
    }
    if (currentSite) {
      crumbs.push({
        type: "page",
        label: currentSite.name || currentSite.slug,
      });
    }
    return crumbs;
  }

  // /dashboard/:id/members
  if (pathname.match(/\/dashboard\/[^/]+\/members/)) {
    const crumbs: Crumb[] = [
      { type: "link", label: "Proyectos", to: "/dashboard" },
    ];
    if (currentProject) {
      crumbs.push({
        type: "link",
        label: currentProject.name,
        to: pathname.replace("/members", ""),
      });
    }
    crumbs.push({ type: "page", label: "Miembros" });
    return crumbs;
  }

  // /dashboard/:id/roles
  if (pathname.match(/\/dashboard\/[^/]+\/roles/)) {
    const crumbs: Crumb[] = [
      { type: "link", label: "Proyectos", to: "/dashboard" },
    ];
    if (currentProject) {
      crumbs.push({
        type: "link",
        label: currentProject.name,
        to: pathname.replace("/roles", ""),
      });
    }
    crumbs.push({ type: "page", label: "Roles y Permisos" });
    return crumbs;
  }

  if (pathname === "/dashboard/account") {
    return [
      { type: "link", label: "Inicio", to: "/dashboard" },
      { type: "page", label: "Cuenta" },
    ];
  }

  // /dashboard/:id  (sites tab, index)
  if (pathname.match(/\/dashboard\/[^/]+$/)) {
    const crumbs: Crumb[] = [
      { type: "link", label: "Proyectos", to: "/dashboard" },
    ];
    if (currentProject) {
      crumbs.push({ type: "page", label: currentProject.name });
    } else {
      crumbs.push({ type: "page", label: "Proyecto" });
    }
    return crumbs;
  }

  // /dashboard
  if (pathname === "/dashboard") {
    return [{ type: "page", label: "Proyectos" }];
  }

  // /dashboard (home)
  return [{ type: "page", label: "Inicio" }];
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { currentSite } = useWorkspace();
  const crumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        {!currentSite ? (
          <>
            <img
              src="/dark-icon.svg"
              alt="SigmaBuilder Logo"
              className="dark:hidden flex aspect-square size-6"
            />
            <img
              src="/icon.svg"
              alt="SigmaBuilder Logo"
              className="hidden dark:flex aspect-square size-6"
            />
          </>
        ) : (
          <Button
            className="size-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <PanelLeftIcon />
          </Button>
        )}

        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />

        <Breadcrumb className="hidden sm:block flex-1 min-w-0">
          <BreadcrumbList>
            {crumbs.map((crumb, i) => (
              <span key={i} className="contents">
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.type === "link" ? (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <NavUser />
      </div>
    </header>
  );
}
