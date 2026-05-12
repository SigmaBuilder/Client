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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";

export function NavUser() {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase()
    : "??";

  return (
    <SidebarMenu className="w-full sm:ml-auto sm:w-auto">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-right text-sm leading-tight">
                <span className="truncate font-medium">
                  {user ? `${user.first_name} ${user.last_name}` : "Usuario"}
                </span>
                <span className="truncate text-xs">
                  {user?.email ?? "Sin sesión"}
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
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette />
                  Cambiar tema
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
                          Oscuro
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="light">
                          <Sun />
                          Claro
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          <MonitorSmartphone />
                          Sistema
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem asChild>
                <Link to="/dashboard/account">
                  <UserRound />
                  Mi Cuenta
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOutIcon />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
