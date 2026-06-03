import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  AlertCircle,
  ArrowUp,
} from "lucide-react";

const GithubIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

export default function SiteHomePage() {
  const { user } = useAuth();
  const { currentSite } = useWorkspace();
  const { t } = useTranslation();

  const firstName = user?.first_name || "usuario";
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("siteHome.greetingMorning")
      : hour < 19
      ? t("siteHome.greetingAfternoon")
      : t("siteHome.greetingEvening");

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden px-4 py-8 sm:px-6 sm:py-8 transition-all duration-500">
      {/* Ambient glow effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-30 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full blur-[120px] opacity-18 dark:opacity-12 z-0"
        style={{ background: "oklch(0.55 0.25 265)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-25 w-100 h-75 rounded-full blur-[120px] opacity-18 dark:opacity-12 z-0"
        style={{ background: "oklch(0.65 0.22 310)" }}
      />

      {/* Main content area */}
      <div className="relative z-10 flex flex-col w-full max-w-3xl flex-1 justify-center items-center overflow-y-auto custom-scrollbar px-2">
        <div className="flex flex-col items-center gap-8 sm:gap-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-600">
          <div className="flex flex-col items-center text-center gap-3">
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
              {t("siteHome.whatDoYouWant")}{" "}
              <span className="font-semibold text-foreground">
                {currentSite?.name || currentSite?.slug || t("siteHome.yourSite")}
              </span>
              {t("siteHome.questionMark")}
            </p>
          </div>

          {/* Premium Preview Notice Card */}
          <div className="w-full max-w-md p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xl flex flex-col items-center text-center gap-4 transition-all duration-300 hover:border-primary/20 hover:shadow-2xl">
            <div className="flex items-center justify-center size-12 rounded-full bg-amber-500/10 text-amber-500 animate-pulse">
              <AlertCircle className="size-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-foreground text-lg">
                {t("siteHome.aiNotAvailableTitle")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("siteHome.aiNotAvailableDesc")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("siteHome.aiNotAvailableRepo")}
              </p>
            </div>
            
            <a
              href="https://github.com/SigmaBuilder"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-foreground hover:opacity-90 text-background transition-all duration-200 shadow-md hover:-translate-y-px active:scale-95 cursor-pointer mt-2"
            >
              <GithubIcon className="size-4" />
              {t("siteHome.viewGithub")}
            </a>
          </div>
        </div>
      </div>

      {/* Disabled Input Section at the bottom */}
      <div className="w-full max-w-3xl pb-8 px-4 sm:px-6 flex flex-col items-center z-20">
        <div className="relative w-full">
          <div className="flex items-center gap-3 pl-4 pr-3 py-3 rounded-[calc(var(--radius,0.625rem)*2)] bg-muted/50 border border-border/40 text-muted-foreground opacity-60 cursor-not-allowed">
            <Sparkles className="shrink-0 size-4.5" />
            <input
              type="text"
              className="flex-1 min-w-0 border-none outline-none bg-transparent text-[0.9375rem] cursor-not-allowed placeholder:text-muted-foreground/60"
              placeholder={t("siteHome.inputDisabledPlaceholder")}
              disabled
            />
            <button
              className="shrink-0 flex items-center justify-center size-8 rounded-[calc(var(--radius,0.625rem)*1.2)] border-none bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
              disabled
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
