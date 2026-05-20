import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  ArrowUp,
  Sparkles,
  Palette,
  FileText,
  ImageIcon,
  LayoutTemplate,
  Zap,
} from "lucide-react";

const suggestions = [
  {
    icon: Palette,
    label: "Cambiar colores del sitio",
    description: "Ajustar la paleta de colores y el tema visual",
  },
  {
    icon: FileText,
    label: "Crear una nueva página",
    description: "Generar una página con contenido y estructura",
  },
  {
    icon: ImageIcon,
    label: "Optimizar imágenes",
    description: "Comprimir y ajustar las imágenes del sitio",
  },
  {
    icon: LayoutTemplate,
    label: "Modificar el layout",
    description: "Reorganizar secciones y estructura visual",
  },
];

export default function SiteHomePage() {
  const { user } = useAuth();
  const { currentSite } = useWorkspace();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const firstName = user?.first_name || "usuario";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="relative flex flex-col items-center justify-center h-full overflow-hidden px-4 py-8 sm:px-6 sm:py-8">
      {/* Ambient glow effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-18 dark:opacity-12 z-0"
        style={{ background: "oklch(0.55 0.25 265)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-80px] right-[-100px] w-[400px] h-[300px] rounded-full blur-[120px] opacity-18 dark:opacity-12 z-0"
        style={{ background: "oklch(0.65 0.22 310)" }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[680px] gap-8 sm:gap-10">
        {/* Greeting section */}
        <div className="flex flex-col items-center text-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-600">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-foreground">
            {greeting},{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.55 0.25 265), oklch(0.60 0.22 310))",
              }}
            >
              {firstName}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            ¿Qué quieres hacer en{" "}
            <span className="font-semibold text-foreground">
              {currentSite?.name || currentSite?.slug || "tu sitio"}
            </span>
            ?
          </p>
        </div>

        {/* Input section */}
        <div className="flex flex-col items-center w-full gap-3 animate-in fade-in slide-in-from-bottom-4 duration-600 delay-100">
          <div className="relative w-full group">
            {/* Animated gradient border glow */}
            <div
              className={`absolute -inset-px rounded-[calc(var(--radius,0.625rem)*2+1px)] z-0 transition-opacity duration-300 ${
                isFocused ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.25 265 / 40%), oklch(0.65 0.22 310 / 40%), oklch(0.55 0.25 265 / 40%))",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 4s ease infinite",
              }}
            />
            <div
              className={`relative z-10 flex items-center gap-3 pl-4 pr-3 py-3 rounded-[calc(var(--radius,0.625rem)*2)] bg-card border transition-all duration-200 ${
                isFocused
                  ? "border-transparent shadow-[0_0_0_1px_oklch(0.55_0.25_265/30%),0_8px_32px_-8px_oklch(0.55_0.25_265/12%)] dark:shadow-[0_0_0_1px_oklch(0.55_0.25_265/40%),0_8px_32px_-8px_oklch(0.55_0.25_265/20%)]"
                  : "border-border"
              }`}
            >
              <Sparkles
                className={`shrink-0 size-[1.125rem] transition-colors duration-200 ${
                  isFocused ? "" : "text-muted-foreground"
                }`}
                style={
                  isFocused ? { color: "oklch(0.55 0.25 265)" } : undefined
                }
              />
              <input
                id="ai-prompt-input"
                type="text"
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-[0.9375rem] text-foreground placeholder:text-muted-foreground font-[inherit]"
                placeholder="Describe lo que quieres modificar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete="off"
              />
              <button
                id="ai-prompt-submit"
                className="shrink-0 flex items-center justify-center size-8 rounded-[calc(var(--radius,0.625rem)*1.2)] border-none cursor-pointer bg-foreground text-background transition-all duration-150 hover:not-disabled:opacity-85 hover:not-disabled:-translate-y-px active:not-disabled:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!query.trim()}
                type="button"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-70">
            <Zap className="size-3" />
            Powered by IA — Describe cambios en lenguaje natural
          </p>
        </div>

        {/* Suggestion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-600 delay-200">
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card text-left font-[inherit] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:border-[oklch(0.55_0.25_265/35%)] hover:bg-[oklch(0.55_0.25_265/4%)] hover:shadow-[0_4px_16px_-4px_oklch(0.55_0.25_265/8%)] dark:hover:border-[oklch(0.55_0.25_265/45%)] dark:hover:bg-[oklch(0.55_0.25_265/8%)] dark:hover:shadow-[0_4px_16px_-4px_oklch(0.55_0.25_265/15%)]"
              onClick={() => setQuery(item.label)}
            >
              <div
                className="flex items-center justify-center size-9 rounded-lg shrink-0"
                style={{
                  background: "oklch(0.55 0.25 265 / 8%)",
                }}
              >
                <item.icon
                  className="size-4"
                  style={{ color: "oklch(0.55 0.25 265)" }}
                />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[0.8125rem] font-semibold text-foreground leading-snug">
                  {item.label}
                </span>
                <span className="text-[0.7rem] text-muted-foreground leading-snug">
                  {item.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
