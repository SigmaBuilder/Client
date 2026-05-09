import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import ThemeToggle from "../shared/ThemeToggle"
import { useAuth } from "@/hooks/use-auth"

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-background/30 backdrop-blur-xl border-b border-border/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-foreground text-lg md:text-xl tracking-tight"
          aria-label="SigmaBuilder - Ir al inicio"
        >
          <img src="/dark-icon.svg" alt="SigmaBuilder Logo" className="h-8 w-8 dark:hidden" />
          <img src="/icon.svg" alt="SigmaBuilder Logo" className="h-8 w-8 hidden dark:block" />
          <span>SigmaBuilder</span>
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
          {!isLoading && (
            isAuthenticated ? (
              <Button variant="default" size="sm" asChild className="rounded-lg">
                <Link to="/dashboard">Ir al Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button variant="default" size="sm" asChild className="rounded-lg">
                  <Link to="/signup">Crear cuenta</Link>
                </Button>
              </>
            )
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
