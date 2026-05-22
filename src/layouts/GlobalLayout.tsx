import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"

export default function GlobalLayout() {
  return (
    <ThemeProvider storageKey="sigma-builder-theme" defaultTheme="system">
      <div className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Outlet />
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
