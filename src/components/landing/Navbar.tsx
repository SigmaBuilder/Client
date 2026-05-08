import { Link } from "react-router-dom"
import ThemeToggle from "../shared/ThemeToggle"

export default function Navbar() {
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
