import { Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftIcon } from "lucide-react"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeftIcon
          />
        </Button>
        {/*
        TODO: LOGO LOADER WHEN NO SIDEBAR
        <img src="/dark-icon.svg" alt="SigmaBuilder Logo" className="dark:hidden flex aspect-square size-6 items-center justify-center text-sidebar-primary-foreground" />
        <img src="/icon.svg" alt="SigmaBuilder Logo" className="hidden dark:flex aspect-square size-6 items-center justify-center text-sidebar-primary-foreground" />
        */}
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Inicio</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <NavUser user={user} />
      </div>
    </header>
  )
}
