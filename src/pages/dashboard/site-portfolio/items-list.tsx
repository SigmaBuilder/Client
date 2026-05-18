import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ExternalLink, Code } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  repository_url: string | null;
  sort_order: number;
}

export default function PortfolioItemsList() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);

  const fetchItems = async () => {
    if (!currentSite?.id) return;
    setIsLoading(true);
    try {
      const res = await api.getPortfolioItems<{ portfolioItems: PortfolioItem[] }>(currentSite.id);
      if (res.success && res.data) {
        setItems(res.data.portfolioItems);
      } else {
        toast.error("Error al cargar los proyectos");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentSite?.id]);

  const handleDelete = async () => {
    if (!currentSite?.id || !itemToDelete) return;
    try {
      const res = await api.deletePortfolioItem(currentSite.id, itemToDelete.id);
      if (res.success) {
        toast.success("Proyecto eliminado");
        fetchItems();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setItemToDelete(null);
    }
  };

  const headerState = useMemo(() => ({
    breadcrumbs: [
      { label: "Portfolio" },
      { label: "Proyectos" }
    ],
    search: {
      value: search,
      onChange: setSearch,
      placeholder: "Buscar proyectos...",
    },
    actions: (
      <Button size="sm" onClick={() => navigate("new")}>
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Añadir Proyecto</span>
        <span className="sm:hidden">Añadir</span>
      </Button>
    ),
  }), [search, navigate]);

  useSetSitePageHeader(headerState);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {filteredItems.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No hay proyectos encontrados.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-40 sm:shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-40 sm:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 sm:h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground/40 text-xs uppercase tracking-wider">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                      #{item.sort_order}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t">
                    <div className="flex gap-2">
                      {item.live_url && (
                        <a
                          href={item.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Demo</span>
                        </a>
                      )}
                      {item.repository_url && (
                        <a
                          href={item.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Code className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Repo</span>
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`${item.id}/edit`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={(open: boolean) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el proyecto "{itemToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
