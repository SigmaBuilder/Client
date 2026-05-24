import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LogOutIcon,
  MonitorSmartphone,
  Moon,
  Palette,
  Sun,
  UserRound,
  Languages,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";

export function NavUser() {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase()
    : "??";

  return (
    <SidebarMenu className="w-fit sm:ml-auto">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-fit px-1.5 sm:px-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="hidden sm:grid flex-1 text-right text-sm leading-tight mr-2">
                <span className="truncate font-medium">
                  {user ? `${user.first_name} ${user.last_name}` : t("navUser.fallbackName")}
                </span>
                <span className="truncate text-xs">
                  {user?.email ?? t("navUser.noSession")}
                </span>
              </div>
              <Avatar className="h-8 w-8 rounded-lg">
                {user?.avatar_url && (
                  <AvatarImage src={user.avatar_url} alt={user.first_name} />
                )}
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette />
                  {t("navUser.changeTheme")}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuGroup>
                      <DropdownMenuRadioGroup
                        value={theme}
                        onValueChange={setTheme as (value: string) => void}
                      >
                        <DropdownMenuRadioItem value="dark">
                          <Moon />
                          {t("navUser.themeDark")}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="light">
                          <Sun />
                          {t("navUser.themeLight")}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          <MonitorSmartphone />
                          {t("navUser.themeSystem")}
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages />
                  Idioma / Language
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuGroup>
                      <DropdownMenuRadioGroup
                        value={i18n.resolvedLanguage || i18n.language}
                        onValueChange={(val) => i18n.changeLanguage(val)}
                      >
                        <DropdownMenuRadioItem value="es">
                          Español
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="en">
                          English
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem asChild>
                <Link to="/dashboard/account">
                  <UserRound />
                  {t("navUser.myAccount")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOutIcon />
              {t("navUser.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
