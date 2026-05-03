import { useState, useEffect, type ReactElement } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle(): ReactElement {
  
  const [isDark, setIsDark] = useState<boolean>(false);
  
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, [])

  const toggleTheme = (): void => {
    const newIsDark = !isDark;
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    setIsDark(newIsDark);
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}