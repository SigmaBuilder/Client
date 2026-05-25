import { Link, useMatches } from "react-router-dom";
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
import { NavUser } from "@/components/layout/nav-user";
import { useWorkspace } from "@/hooks/use-workspace";
import { useTranslation } from "react-i18next";

interface RouteHandle {
  breadcrumb?: string | ((data: unknown) => string);
}

interface BreadcrumbItem {
  label: string;
  to: string;
  isPage: boolean;
}

function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches();
  const { currentProject, currentSite } = useWorkspace();

  const contextData: Record<string, unknown> = {
    project: currentProject,
    site: currentSite,
  };

  return matches
    .filter((match) => {
      const handle = match.handle as RouteHandle | undefined;
      return handle?.breadcrumb !== undefined;
    })
    .map((match, index, arr) => {
      const handle = match.handle as RouteHandle;
      const raw = handle.breadcrumb!;
      const label = typeof raw === "function" ? raw(contextData) : raw;

      return {
        label,
        to: match.pathname,
        isPage: index === arr.length - 1,
      };
    });
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { currentSite } = useWorkspace();
  const crumbs = useBreadcrumbs();
  const { t } = useTranslation();

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
              <span key={crumb.to} className="contents">
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isPage ? (
                    <BreadcrumbPage>{t(crumb.label)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{t(crumb.label)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile title context */}
        <div className="sm:hidden flex-1 min-w-0 px-2">
          {currentSite ? (
            <span className="font-semibold text-sm truncate block">
              {currentSite.name || currentSite.slug}
            </span>
          ) : crumbs.length > 0 ? (
            <span className="font-semibold text-sm truncate block">
              {t(crumbs[crumbs.length - 1].label)}
            </span>
          ) : null}
        </div>

        <NavUser />
      </div>
    </header>
  );
}
