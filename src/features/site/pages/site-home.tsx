import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { getAccessToken } from "@/lib/auth";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from 'react-markdown';
import { useTranslation } from "react-i18next";
import {
  ArrowUp,
  Sparkles,
  Palette,
  FileText,
  ImageIcon,
  LayoutTemplate,
  Zap,
  Loader2,
  Bot,
  User as UserIcon,
  AlertCircle,
  Search,
  FolderOpen,
  FilePlus,
  Package,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

/* ─── Tool metadata for pretty rendering ─────────────────────────────────── */
const getToolMeta = (t: any): Record<
  string,
  { icon: typeof Zap; label: string; activeLabel: string; doneLabel: string }
> => ({
  get_pages: {
    icon: FolderOpen,
    label: t("siteHome.toolGetPages"),
    activeLabel: t("siteHome.toolGetPagesActive"),
    doneLabel: t("siteHome.toolGetPagesDone"),
  },
  search_page_content: {
    icon: Search,
    label: t("siteHome.toolSearch"),
    activeLabel: t("siteHome.toolSearchActive"),
    doneLabel: t("siteHome.toolSearchDone"),
  },
  set_home_page: {
    icon: CheckCircle2,
    label: t("siteHome.toolSetHome"),
    activeLabel: t("siteHome.toolSetHomeActive"),
    doneLabel: t("siteHome.toolSetHomeDone"),
  },
  publish_page: {
    icon: Zap,
    label: t("siteHome.toolPublishPage"),
    activeLabel: t("siteHome.toolPublishPageActive"),
    doneLabel: t("siteHome.toolPublishPageDone"),
  },
  publish_all_pages: {
    icon: Zap,
    label: t("siteHome.toolPublishAll"),
    activeLabel: t("siteHome.toolPublishAllActive"),
    doneLabel: t("siteHome.toolPublishAllDone"),
  },
  get_page_content: {
    icon: FileText,
    label: t("siteHome.toolGetPage"),
    activeLabel: t("siteHome.toolGetPageActive"),
    doneLabel: t("siteHome.toolGetPageDone"),
  },
  create_page: {
    icon: FilePlus,
    label: t("siteHome.toolCreatePage"),
    activeLabel: t("siteHome.toolCreatePageActive"),
    doneLabel: t("siteHome.toolCreatePageDone"),
  },
  get_site_modules: {
    icon: Package,
    label: t("siteHome.toolGetModules"),
    activeLabel: t("siteHome.toolGetModulesActive"),
    doneLabel: t("siteHome.toolGetModulesDone"),
  },
});

const getToolInfo = (name: string, t: any) =>
  getToolMeta(t)[name] ?? {
    icon: Zap,
    label: name,
    activeLabel: t("siteHome.executing", { name }),
    doneLabel: t("siteHome.completed", { name }),
  };

/* ─── Suggestions ─────────────────────────────────────────────────────────── */
const getSuggestions = (t: any) => [
  {
    icon: Palette,
    label: t("siteHome.sugColors"),
    description: t("siteHome.sugColorsDesc"),
  },
  {
    icon: FileText,
    label: t("siteHome.sugNewPage"),
    description: t("siteHome.sugNewPageDesc"),
  },
  {
    icon: ImageIcon,
    label: t("siteHome.sugImages"),
    description: t("siteHome.sugImagesDesc"),
  },
  {
    icon: LayoutTemplate,
    label: t("siteHome.sugLayout"),
    description: t("siteHome.sugLayoutDesc"),
  },
];

/* ─── Thinking dots animation (CSS-in-JS keyframe) ─────────────────────── */
const thinkingDotsStyle = `
@keyframes thinking-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
`;

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function SiteHomePage() {
  const { user } = useAuth();
  const { currentSite } = useWorkspace();
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const firstName = user?.first_name || "usuario";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("siteHome.greetingMorning") : hour < 19 ? t("siteHome.greetingAfternoon") : t("siteHome.greetingEvening");

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.PUBLIC_URL_API || "http://localhost:3000/api/v1"}/sites/${currentSite?.id}/ai/chat`,
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }),
    onError: (err) => {
      console.error("[AI Chat Error]", err);
      setError(
        err.message?.includes("model")
          ? t("siteHome.errModel")
          : err.message?.includes("fetch")
            ? t("siteHome.errNetwork")
            : err.message || t("siteHome.errUnexpected"),
      );
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  /* ── Auto-scroll ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /* ── Submit handler ───────────────────────────────────────────────────── */
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input || input.trim() === "" || isLoading) return;
      setError(null);
      sendMessage({ text: input });
      setInput("");
    },
    [input, isLoading, sendMessage],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSuggestionClick = (label: string) => {
    setError(null);
    sendMessage({ text: label });
  };

  const dismissError = () => setError(null);

  const handleRetry = () => {
    setError(null);
    // Remove the last assistant message (the failed one) and resend
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      const lastUserText = lastUserMsg.parts?.find((p) => p.type === "text");
      if (lastUserText && lastUserText.type === "text") {
        // Remove failed assistant messages after last user message
        const lastUserIdx = messages.lastIndexOf(lastUserMsg);
        setMessages(messages.slice(0, lastUserIdx + 1));
        sendMessage({ text: lastUserText.text });
      }
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex flex-col items-center justify-between h-full overflow-hidden px-4 py-8 sm:px-6 sm:py-8 transition-all duration-500">
      {/* Inject keyframe animation */}
      <style>{thinkingDotsStyle}</style>

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

      {/* ── Main content area ──────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className={`relative z-10 flex flex-col w-full max-w-3xl flex-1 overflow-y-auto pb-32 px-2 ${
          !hasMessages ? "justify-center items-center" : "justify-start"
        }`}
      >
        {!hasMessages ? (
          /* ── Empty state (greeting + suggestions) ─────────────────── */
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-170">
              {getSuggestions(t).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card text-left font-[inherit] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:border-[oklch(0.55_0.25_265/35%)] hover:bg-[oklch(0.55_0.25_265/4%)] hover:shadow-[0_4px_16px_-4px_oklch(0.55_0.25_265/8%)] dark:hover:border-[oklch(0.55_0.25_265/45%)] dark:hover:bg-[oklch(0.55_0.25_265/8%)] dark:hover:shadow-[0_4px_16px_-4px_oklch(0.55_0.25_265/15%)]"
                  onClick={() => handleSuggestionClick(item.label)}
                >
                  <div
                    className="flex items-center justify-center size-9 rounded-lg shrink-0"
                    style={{ background: "oklch(0.55 0.25 265 / 8%)" }}
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
        ) : (
          /* ── Messages ─────────────────────────────────────────────── */
          <div className="flex flex-col gap-6 w-full py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar (assistant) */}
                {m.role !== "user" && (
                  <div className="shrink-0 flex items-center justify-center size-8 rounded-full bg-primary/10 mt-1">
                    <Bot className="size-4 text-primary" />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-2 max-w-[80%] ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {m.parts?.map((part, i) => {
                    /* ── Text part ──────────────────────────────────── */
                    if (part.type === "text") {
                      if (!part.text) return null;
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl text-[0.9375rem] leading-relaxed ${
                            m.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-card border text-foreground rounded-tl-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:mb-2 [&>ol]:mb-2 [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0"
                          }`}
                        >
                          {m.role === "user" ? (
                            <div className="whitespace-pre-wrap">{part.text}</div>
                          ) : (
                            <ReactMarkdown>{part.text}</ReactMarkdown>
                          )}
                        </div>
                      );
                    }

                    /* ── Tool part ──────────────────────────────────── */
                    if (
                      part.type.startsWith("tool-") ||
                      part.type === "dynamic-tool"
                    ) {
                      const toolName =
                        part.type === "dynamic-tool"
                          ? (part as any).toolName
                          : part.type.replace("tool-", "");
                      const state = (part as any).state as string;
                      // When the stream is done, treat all non-error tool parts as completed
                      const isCompleted =
                        state === "result" || (!isLoading && state !== "error");
                      const isFailed = state === "error";
                      const info = getToolInfo(toolName, t);
                      const ToolIcon = info.icon;

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 text-xs p-3 rounded-xl border transition-all duration-300 ${
                            isCompleted
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : isFailed
                                ? "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-400"
                                : "bg-primary/5 border-primary/15 text-primary"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center size-7 rounded-lg shrink-0 ${
                              isCompleted
                                ? "bg-emerald-500/10"
                                : isFailed
                                  ? "bg-red-500/10"
                                  : "bg-primary/10"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : isFailed ? (
                              <XCircle className="size-3.5" />
                            ) : (
                              <ToolIcon className="size-3.5 animate-pulse" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-medium leading-none">
                              {isCompleted
                                ? info.doneLabel
                                : isFailed
                                  ? `${t("siteHome.errPrefix")} ${info.label}`
                                  : info.activeLabel}
                            </span>
                            {!isCompleted && !isFailed && (
                              <div className="flex gap-0.5 mt-1">
                                {[0, 1, 2].map((dot) => (
                                  <div
                                    key={dot}
                                    className="size-1 rounded-full bg-current"
                                    style={{
                                      animation: `thinking-bounce 1.4s ease-in-out ${dot * 0.2}s infinite`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {!isCompleted && !isFailed && (
                            <Loader2 className="size-3.5 animate-spin ml-auto opacity-50" />
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Avatar (user) */}
                {m.role === "user" && (
                  <div className="shrink-0 flex items-center justify-center size-8 rounded-full bg-muted mt-1">
                    <UserIcon className="size-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* ── Thinking indicator ─────────────────────────────── */}
            {isLoading &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role === "user") && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 flex items-center justify-center size-8 rounded-full bg-primary/10 mt-1">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl rounded-tl-sm bg-card border">
                    <div className="flex items-center gap-1.5">
                      <Sparkles
                        className="size-4 animate-pulse"
                        style={{ color: "oklch(0.55 0.25 265)" }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {t("siteHome.thinking")}
                      </span>
                      <div className="flex gap-0.5 ml-0.5">
                        {[0, 1, 2].map((dot) => (
                          <div
                            key={dot}
                            className="size-1.5 rounded-full"
                            style={{
                              background: "oklch(0.55 0.25 265)",
                              animation: `thinking-bounce 1.4s ease-in-out ${dot * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div className="relative z-10 w-full max-w-3xl mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
            <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                {error}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 transition-colors cursor-pointer border-none"
              >
                <RotateCcw className="size-3" />
                {t("siteHome.retryBtn")}
              </button>
              <button
                type="button"
                onClick={dismissError}
                className="flex items-center justify-center size-7 rounded-lg hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Input section (Sticky with Gradient) ──────────────────────── */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-24 pb-8 px-4 sm:px-6 flex flex-col items-center z-20 pointer-events-none">
        <div className="relative z-10 flex flex-col items-center w-full max-w-3xl gap-3 transition-all duration-500 pointer-events-auto">
          <form onSubmit={onSubmit} className="relative w-full group">
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
              className={`relative z-10 flex items-center gap-3 pl-4 pr-3 py-3 rounded-[calc(var(--radius,0.625rem)*2)] bg-card/90 backdrop-blur-md border shadow-lg transition-all duration-200 ${
                isFocused
                  ? "border-transparent shadow-[0_0_0_1px_oklch(0.55_0.25_265/30%),0_8px_32px_-8px_oklch(0.55_0.25_265/12%)] dark:shadow-[0_0_0_1px_oklch(0.55_0.25_265/40%),0_8px_32px_-8px_oklch(0.55_0.25_265/20%)]"
                  : "border-border/50"
              }`}
            >
              <Sparkles
                className={`shrink-0 size-4.5 transition-colors duration-200 ${
                  isFocused ? "" : "text-muted-foreground"
                }`}
                style={isFocused ? { color: "oklch(0.55 0.25 265)" } : undefined}
              />
              <input
                id="ai-prompt-input"
                name="prompt"
                type="text"
                className="flex-1 min-w-0 border-none outline-none bg-transparent text-[0.9375rem] text-foreground placeholder:text-muted-foreground font-[inherit]"
                placeholder={t("siteHome.inputPlaceholder")}
                value={input}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete="off"
                disabled={isLoading}
              />
              <button
                id="ai-prompt-submit"
                className="shrink-0 flex items-center justify-center size-8 rounded-[calc(var(--radius,0.625rem)*1.2)] border-none cursor-pointer bg-foreground text-background transition-all duration-150 hover:not-disabled:opacity-85 hover:not-disabled:-translate-y-px active:not-disabled:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!input || input.trim() === "" || isLoading}
                type="submit"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </button>
            </div>
          </form>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-70 bg-background/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Zap className="size-3" />
            {t("siteHome.poweredBy")}
          </p>
        </div>
      </div>
    </div>
  );
}
