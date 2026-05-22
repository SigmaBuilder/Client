import { useEffect, useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { api, API_URL } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { BookOpen, Copy, Server, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DocParameter {
  name: string;
  type: string;
  description: string;
}

interface DocEndpoint {
  name: string;
  path: string;
  method: string;
  description: string;
  parameters: DocParameter[];
  returns?: any;
}

interface DocModule {
  name: string;
  description: string;
  endpoints: DocEndpoint[];
}

interface DocsData {
  [key: string]: DocModule;
}

export default function SiteDocsPage() {
  const { currentSite } = useWorkspace();
  const [docs, setDocs] = useState<DocsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useSetSitePageHeader({
    breadcrumbs: [{ label: "Documentación API" }],
  });

  useEffect(() => {
    const fetchDocs = async () => {
      if (!currentSite?.slug) return;
      setIsLoading(true);
      try {
        const res = await api.getSitePublicDocs<{ data: DocsData }>(currentSite.slug, false);
        if (res.success && res.data) {
          setDocs(res.data as any);
        } else {
          toast.error(res.error || "Error al cargar la documentación");
        }
      } catch (err) {
        toast.error("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, [currentSite?.slug]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copiado al portapapeles");
    });
  };

  const baseUrl = API_URL.replace(/\/api\/v1\/?$/, "");

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!docs) {
    return <div className="p-6 text-muted-foreground">No se pudo cargar la documentación.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Documentación de API Pública
        </h1>
        <p className="text-muted-foreground mt-2">
          Esta página contiene la documentación de todos los endpoints públicos disponibles para tu sitio <strong>{currentSite?.name}</strong>. Puedes usar estas rutas en el código JavaScript de tus páginas para obtener información dinámica.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
          <Server className="h-5 w-5" /> Base URL
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          El origen (host) al que debes hacer las peticiones, que debes prefijar en los endpoints mostrados abajo.
        </p>
        <div className="flex items-center gap-2 bg-background p-2 rounded border font-mono text-sm">
          <span className="flex-1 overflow-x-auto whitespace-nowrap">{baseUrl}</span>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(baseUrl)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        {Object.entries(docs).map(([modKey, mod]) => (
          <div key={modKey} className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileJson className="h-6 w-6 text-muted-foreground" />
                {mod.name}
              </h2>
              <p className="text-muted-foreground mt-1">{mod.description}</p>
            </div>

            <div className="grid gap-6">
              {mod.endpoints.map((ep, i) => {
                const finalPath = ep.path.replace('{slug}', currentSite?.slug || '{slug}');
                
                return (
                  <div key={i} className="border rounded-xl bg-card overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-muted/30 p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{ep.name}</h3>
                        <p className="text-sm text-muted-foreground">{ep.description}</p>
                      </div>
                    </div>
                    
                    {/* Endpoint URL */}
                    <div className="p-4 border-b bg-background flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                      <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
                        <Badge variant={ep.method === 'GET' ? 'default' : 'secondary'} className="text-xs shrink-0">
                          {ep.method}
                        </Badge>
                        <code className="text-sm font-mono whitespace-nowrap">
                          {baseUrl}{finalPath}
                        </code>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => copyToClipboard(`${baseUrl}${finalPath}`)}>
                        <Copy className="h-4 w-4 mr-2" /> Copiar Ruta
                      </Button>
                    </div>

                    {/* Parameters */}
                    {ep.parameters && ep.parameters.length > 0 && (
                      <div className="p-4">
                        <h4 className="font-semibold text-sm mb-3">Parámetros</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                              <tr>
                                <th className="px-4 py-2 font-medium rounded-tl-md">Nombre</th>
                                <th className="px-4 py-2 font-medium">Tipo</th>
                                <th className="px-4 py-2 font-medium rounded-tr-md">Descripción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ep.parameters.map((param, j) => (
                                <tr key={j} className="border-b last:border-0">
                                  <td className="px-4 py-3 font-mono font-medium">{param.name}</td>
                                  <td className="px-4 py-3">
                                    <Badge variant="outline" className="text-[10px]">{param.type}</Badge>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Returns */}
                    {ep.returns && (
                      <div className="p-4 border-t bg-muted/10">
                        <h4 className="font-semibold text-sm mb-3">Respuesta Esperada</h4>
                        <div className="bg-background rounded-md border p-3 overflow-x-auto">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                            {JSON.stringify(ep.returns, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
