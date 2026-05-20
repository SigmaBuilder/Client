import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Save,
  Code,
  Braces,
  AlignLeft,
  Terminal,
  LayoutPanelLeft,
  RefreshCw,
  PanelRightClose,
  PanelRightOpen,
  Settings,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { NavigationBlocker } from "@/components/NavigationBlocker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LogEntry {
  type: string;
  args: any[];
  timestamp: number;
}

const apiModules = {
  core: [{ name: "Obtener Sitio", path: "/sites/slug/{slug}", method: "GET" }],
  blog: [
    {
      name: "Listar Posts",
      path: "/sites/slug/{slug}/blog/posts",
      method: "GET",
    },
    {
      name: "Obtener Post",
      path: "/sites/slug/{slug}/blog/posts/{postSlug}",
      method: "GET",
    },
    {
      name: "Listar Categorías",
      path: "/sites/slug/{slug}/blog/categories",
      method: "GET",
    },
  ],
  portfolio: [
    {
      name: "Listar Secciones",
      path: "/sites/slug/{slug}/portfolio/sections",
      method: "GET",
    },
    {
      name: "Listar Tecnologías",
      path: "/sites/slug/{slug}/portfolio/stack",
      method: "GET",
    },
    {
      name: "Listar Proyectos",
      path: "/sites/slug/{slug}/portfolio/items",
      method: "GET",
    },
  ],
};

export default function PageEditor() {
  const { currentSite } = useWorkspace();
  const { pageId } = useParams();
  const navigate = useNavigate();
  const isNew = !pageId || pageId === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "public">("draft");

  const defaultHtml = '<div id="app">\n  <h1>Hello World</h1>\n</div>';
  const defaultCss = "body {\n  font-family: sans-serif;\n}";
  const defaultJs = "console.log('App loaded');";

  const [htmlContent, setHtmlContent] = useState(defaultHtml);
  const [cssContent, setCssContent] = useState(defaultCss);
  const [jsContent, setJsContent] = useState(defaultJs);

  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const baseUrl =
    import.meta.env.PUBLIC_URL_API || window.location.origin + "/api/v1";

  // Unsaved changes detection
  const [initialData, setInitialData] = useState({
    name: "",
    slug: "",
    status: "draft" as "draft" | "public",
    html: defaultHtml,
    css: defaultCss,
    js: defaultJs,
  });

  const hasUnsavedChanges = useMemo(() => {
    return (
      name !== initialData.name ||
      slug !== initialData.slug ||
      status !== initialData.status ||
      htmlContent !== initialData.html ||
      cssContent !== initialData.css ||
      jsContent !== initialData.js
    );
  }, [name, slug, status, htmlContent, cssContent, jsContent, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fetch page data
  useEffect(() => {
    const fetchPage = async () => {
      if (!currentSite?.id || isNew) return;
      setIsLoading(true);
      try {
        const res = await api.getSitePage<any>(currentSite.id, pageId!);
        if (res.success && res.data) {
          const page = res.data.page || res.data;
          setName(page.title || page.name || "");
          setSlug(page.slug);
          setStatus(page.status);

          const html = page.html || page.content?.html || "";
          const css = page.css || page.content?.css || "";
          const js = page.js || page.content?.js || "";

          setHtmlContent(html);
          setCssContent(css);
          setJsContent(js);

          setInitialData({
            name: page.title || page.name || "",
            slug: page.slug,
            status: page.status,
            html,
            css,
            js,
          });
        } else {
          toast.error("Error al cargar la página");
          navigate("..");
        }
      } catch {
        toast.error("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [currentSite?.id, pageId, isNew, navigate]);

  // Run preview
  const updatePreview = useCallback(() => {
    if (!iframeRef.current) return;

    const iframeDoc =
      iframeRef.current.contentDocument ||
      iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;

    setLogs([]); // clear previous logs

    const combinedHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>
          // Intercept console.log
          const originalConsoleLog = console.log;
          const originalConsoleError = console.error;
          const originalConsoleWarn = console.warn;
          const originalConsoleInfo = console.info;

          function sendLogToParent(type, args) {
            window.parent.postMessage({
              source: 'preview-iframe',
              type,
              args: Array.from(args).map(arg => {
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                } catch(e) {
                  return String(arg);
                }
              })
            }, '*');
          }

          console.log = function() {
            sendLogToParent('log', arguments);
            originalConsoleLog.apply(console, arguments);
          };
          console.error = function() {
            sendLogToParent('error', arguments);
            originalConsoleError.apply(console, arguments);
          };
          console.warn = function() {
            sendLogToParent('warn', arguments);
            originalConsoleWarn.apply(console, arguments);
          };
          console.info = function() {
            sendLogToParent('info', arguments);
            originalConsoleInfo.apply(console, arguments);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            sendLogToParent('error', [message + ' at ' + lineno + ':' + colno]);
            return false;
          };
        </script>
        <script>
          try {
            ${jsContent}
          } catch(e) {
            console.error(e.toString());
          }
        </script>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(combinedHtml);
    iframeDoc.close();
  }, [htmlContent, cssContent, jsContent]);

  // Initial preview and update on hotkey
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 1000);
    return () => clearTimeout(timer);
  }, [htmlContent, cssContent, jsContent, updatePreview]);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source === "preview-iframe") {
        setLogs((prev) => [
          ...prev,
          {
            type: event.data.type,
            args: event.data.args,
            timestamp: Date.now(),
          },
        ]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSave = async () => {
    if (!currentSite?.id) return;
    if (!name || !slug) {
      toast.error("El nombre y la ruta son obligatorios");
      setIsSettingsOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        title: name,
        slug,
        status,
        html: htmlContent,
        css: cssContent,
        js: jsContent,
      };

      let res: any;
      if (isNew) {
        res = await api.createSitePage(currentSite.id, data);
      } else {
        res = await api.updateSitePage(currentSite.id, pageId!, data);
      }

      if (res.success) {
        toast.success(isNew ? "Página creada" : "Página actualizada");
        setInitialData({
          name,
          slug,
          status,
          html: htmlContent,
          css: cssContent,
          js: jsContent,
        });
        if (isNew && (res.data?.id || res.data?.page?.id)) {
          navigate(`../${res.data?.id || res.data?.page?.id}/edit`, {
            replace: true,
          });
        }
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Endpoint copiado al portapapeles");
    });
  };

  const headerState = useMemo(
    () => ({
      breadcrumbs: [
        {
          label: "Páginas",
          href: `/dashboard/site/${currentSite?.slug}/pages`,
          onClick: () => navigate(".."),
        },
        { label: isNew ? "Nueva" : name || "Editar" },
      ],
      actions: (
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground mr-2">
              * Cambios sin guardar
            </span>
          )}

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Ajustes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajustes de la página</DialogTitle>
                <DialogDescription>
                  Configura el nombre y la ruta de la página.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Ej. Inicio"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Ruta (Slug)</Label>
                  <Input
                    id="slug"
                    placeholder="slug-de-la-ruta"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutPanelLeft className="h-4 w-4 mr-2" />
                API
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[400px] sm:w-[540px] overflow-y-auto px-6 pt-4"
            >
              <SheetHeader className="px-0">
                <SheetTitle>Endpoints disponibles</SheetTitle>
                <SheetDescription>
                  Endpoints para los módulos activos de este sitio.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 flex flex-col gap-6">
                <div className="text-sm font-medium">
                  Clave Pública (API Key): {currentSite?.slug}
                </div>

                <div className="bg-primary/5 p-4 rounded-md text-sm border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" /> Filtrado y Paginación
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-2">
                    Los endpoints que devuelven listas (como "Listar Posts" o "Listar Secciones") soportan los siguientes parámetros en la URL para que puedas filtrar la información:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 mb-3">
                    <li><code className="bg-background border px-1 py-0.5 rounded mr-1 font-mono">?page=1</code> Página a cargar (por defecto 1).</li>
                    <li><code className="bg-background border px-1 py-0.5 rounded mr-1 font-mono">?limit=10</code> Elementos por página (por defecto 10). Para cargar todos, puedes usar un número alto como 100 o 1000.</li>
                    <li><code className="bg-background border px-1 py-0.5 rounded mr-1 font-mono">?search=texto</code> Busca elementos que contengan el texto en su título.</li>
                  </ul>
                  <div className="text-xs text-muted-foreground bg-background border p-2 rounded break-all">
                    <span className="font-semibold block mb-1">Ejemplo:</span> 
                    <code className="font-mono text-[11px]">{baseUrl}/sites/slug/{currentSite?.slug}/portfolio/sections?page=1&limit=50&search=hola</code>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold border-b pb-2">
                      Core
                    </h4>
                    {apiModules.core.map((ep, i) => {
                      const fullPath = `${baseUrl}${ep.path.replace("{slug}", currentSite?.slug || "")}`;
                      return (
                        <div
                          key={i}
                          className="flex flex-col gap-1 p-3 rounded-md bg-secondary/50 border"
                        >
                          <div className="font-semibold text-sm">{ep.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground break-all flex items-start gap-2">
                            <span className="font-bold text-primary shrink-0">
                              {ep.method}
                            </span>
                            <span className="break-all">{fullPath}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full h-7 text-xs"
                            onClick={() => copyToClipboard(fullPath)}
                          >
                            Copiar URL
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {currentSite?.features?.modules?.blog && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold border-b pb-2">Blog</h4>
                      {apiModules.blog.map((ep, i) => {
                        const fullPath = `${baseUrl}${ep.path.replace('{slug}', currentSite?.slug || '')}`;
                        return (
                          <div key={i} className="flex flex-col gap-1 p-3 rounded-md bg-secondary/50 border">
                            <div className="font-semibold text-sm">{ep.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground break-all flex items-start gap-2">
                              <span className="font-bold text-primary shrink-0">{ep.method}</span>
                              <span className="break-all">{fullPath}</span>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2 w-full h-7 text-xs" onClick={() => copyToClipboard(fullPath)}>
                              Copiar URL
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentSite?.features?.modules?.portfolio && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold border-b pb-2">Portfolio</h4>
                      {apiModules.portfolio.map((ep, i) => {
                        const fullPath = `${baseUrl}${ep.path.replace('{slug}', currentSite?.slug || '')}`;
                        return (
                          <div key={i} className="flex flex-col gap-1 p-3 rounded-md bg-secondary/50 border">
                            <div className="font-semibold text-sm">{ep.name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground break-all flex items-start gap-2">
                              <span className="font-bold text-primary shrink-0">{ep.method}</span>
                              <span className="break-all">{fullPath}</span>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2 w-full h-7 text-xs" onClick={() => copyToClipboard(fullPath)}>
                              Copiar URL
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentSite?.features?.portfolio && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold border-b pb-2">
                        Portfolio
                      </h4>
                      {apiModules.portfolio.map((ep, i) => {
                        const fullPath = `${baseUrl}${ep.path.replace("{slug}", currentSite?.slug || "")}`;
                        return (
                          <div
                            key={i}
                            className="flex flex-col gap-1 p-3 rounded-md bg-secondary/50 border"
                          >
                            <div className="font-semibold text-sm">
                              {ep.name}
                            </div>
                            <div className="font-mono text-[11px] text-muted-foreground break-all flex items-start gap-2">
                              <span className="font-bold text-primary shrink-0">
                                {ep.method}
                              </span>
                              <span className="break-all">{fullPath}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full h-7 text-xs"
                              onClick={() => copyToClipboard(fullPath)}
                            >
                              Copiar URL
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    Cerrar
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Select
            value={status}
            onValueChange={(v: "draft" | "public") => setStatus(v)}
          >
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="public">Público</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>

          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Guardar</span>
          </Button>
        </div>
      ),
    }),
    [
      isNew,
      name,
      slug,
      currentSite,
      navigate,
      hasUnsavedChanges,
      status,
      isSaving,
      handleSave,
      showPreview,
      baseUrl,
      isSettingsOpen,
    ],
  );

  useSetSitePageHeader(headerState);

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <NavigationBlocker shouldBlock={hasUnsavedChanges} />
      {/* Editor & Preview Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div
          className={`${showPreview ? "w-1/2 border-r" : "w-full"} flex flex-col transition-all duration-300`}
        >
          <div className="flex border-b bg-muted/30">
            <button
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "html" ? "border-b-2 border-primary bg-background" : "hover:bg-muted/50"}`}
              onClick={() => setActiveTab("html")}
            >
              <Code className="h-4 w-4 text-orange-500" /> HTML
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "css" ? "border-b-2 border-primary bg-background" : "hover:bg-muted/50"}`}
              onClick={() => setActiveTab("css")}
            >
              <Braces className="h-4 w-4 text-blue-500" /> CSS
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "js" ? "border-b-2 border-primary bg-background" : "hover:bg-muted/50"}`}
              onClick={() => setActiveTab("js")}
            >
              <AlignLeft className="h-4 w-4 text-yellow-500" /> JS
            </button>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={
                activeTab === "html"
                  ? "html"
                  : activeTab === "css"
                    ? "css"
                    : "javascript"
              }
              theme="vs-dark"
              value={
                activeTab === "html"
                  ? htmlContent
                  : activeTab === "css"
                    ? cssContent
                    : jsContent
              }
              onChange={(val) => {
                const v = val || "";
                if (activeTab === "html") setHtmlContent(v);
                if (activeTab === "css") setCssContent(v);
                if (activeTab === "js") setJsContent(v);
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </div>
        </div>

        {/* Right: Preview & Console */}
        {showPreview && (
          <div className="w-1/2 flex flex-col relative bg-white transition-all duration-300">
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full shadow-md"
              onClick={updatePreview}
              title="Recargar Preview"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <iframe
                ref={iframeRef}
                title="preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>

            {/* Console */}
            <div
              className={`border-t bg-card transition-all duration-300 flex flex-col ${isConsoleOpen ? "h-48" : "h-8"}`}
            >
              <div
                className="flex items-center justify-between px-3 h-8 cursor-pointer hover:bg-muted/50 border-b select-none"
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Terminal className="h-3 w-3" /> Console
                  {logs.length > 0 && (
                    <span className="bg-primary/20 text-primary px-1.5 rounded-full text-[10px]">
                      {logs.length}
                    </span>
                  )}
                </div>
              </div>
              {isConsoleOpen && (
                <div className="flex-1 overflow-auto p-2 font-mono text-xs bg-zinc-950 text-zinc-300">
                  {logs.length === 0 ? (
                    <div className="text-zinc-600 italic">No hay logs...</div>
                  ) : (
                    logs.map((log, i) => (
                      <div
                        key={i}
                        className={`py-1 border-b border-zinc-800/50 ${log.type === "error" ? "text-red-400" : log.type === "warn" ? "text-yellow-400" : ""}`}
                      >
                        <span className="opacity-50 mr-2 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        {log.args.join(" ")}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
