import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface PortfolioStackItem {
  id: string;
  name: string;
  icon_url: string | null;
}

export default function PortfolioStackList() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
const [items, setItems] = useState<PortfolioStackItem[]>([]);
const [meta, setMeta] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);
const [search, setSearch] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [limit] = useState(10);
const [itemToDelete, setItemToDelete] = useState<PortfolioStackItem | null>(
  null,
);

  const fetchItems = async (searchValue = search, page = currentPage, perPage = limit) => {
    if (!currentSite?.id) return;
    setIsLoading(true);
    try {
      const res = await api.getPortfolioStack<any>(currentSite.id, page, perPage, searchValue);
      if (res.success && res.data) {
        if (res.meta) {
          setMeta(res.meta);
        } else if (res.data.meta) {
          setMeta(res.data.meta);
        }
        const dataArray =
          Array.isArray(res.data?.data) ? res.data.data :
          Array.isArray(res.data?.stack) ? res.data.stack :
          Array.isArray(res.data?.portfolioStack) ? res.data.portfolioStack :
          Array.isArray(res.data) ? res.data : [];
        setItems(dataArray);
      } else {
        toast.error("Error al cargar el stack");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [currentSite?.id]);

  useEffect(() => {
    fetchItems(search, currentPage, limit);
  }, [currentSite?.id, search, currentPage, limit]);

  const handleDelete = async () => {
    if (!currentSite?.id || !itemToDelete) return;
    try {
      const res = await api.deletePortfolioStackItem(
        currentSite.id,
        itemToDelete.id,
      );
      if (res.success) {
        toast.success("Tecnología eliminada");
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

const debouncedSetSearch = useDebouncedCallback((val: string) => setSearch(val), 400);

const headerState = useMemo(
    () => ({
      breadcrumbs: [{ label: "Portfolio" }, { label: "Stack" }],
      search: {
        value: search,
        onChange: debouncedSetSearch,
        placeholder: "Buscar tecnologías...",
      },
      actions: (
        <Button size="sm" onClick={() => navigate("new")}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Añadir Tecnología</span>
          <span className="sm:hidden">Añadir</span>
        </Button>
      ),
    }),
    [search, navigate],
  );

  useSetSitePageHeader(headerState);

// Use the fetched data (server-side search):
const filteredItems = items;


  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  // Empty state for paginated search
  if (!isLoading && items.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="text-muted-foreground">No hay tecnologías encontradas.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle>Stack tecnológico</CardTitle>
          <CardDescription>
            Administra y visualiza las tecnologías de tu portafolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-15">Icono</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No hay tecnologías encontradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.icon_url ? (
                          <img
                            src={item.icon_url}
                            alt={item.name}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`${item.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setItemToDelete(item)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button size="sm" variant="secondary" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            &lt; Anterior
          </Button>
          <span>Página {currentPage} de {meta.totalPages}</span>
          <Button size="sm" variant="secondary" onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))} disabled={currentPage === meta.totalPages}>
            Siguiente &gt;
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open: boolean) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tecnología?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará "
              {itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
