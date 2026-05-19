import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";

interface SitePage {
  id: string;
  name?: string;
  title?: string;
  slug: string;
  status: "draft" | "public";
}

export default function PagesList() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
  const [pages, setPages] = useState<SitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageToDelete, setPageToDelete] = useState<SitePage | null>(null);

  const fetchPages = async () => {
    if (!currentSite?.id) return;
    setIsLoading(true);
    try {
      const res = await api.getSitePages<any>(currentSite.id);
      if (res.success && res.data) {
        // En el backend `res.json({ success: true, data: pages })`
        // Por la implementación de lib/api.ts, `res.data` ES directamente el array (si es lo que devolvió el backend en 'data')
        const dataArray = Array.isArray(res.data) ? res.data : (res.data.pages || []);
        setPages(dataArray);
      } else {
        toast.error("Error al cargar las páginas");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [currentSite?.id]);

  const handleDelete = async () => {
    if (!currentSite?.id || !pageToDelete) return;
    try {
      const res = await api.deleteSitePage(currentSite.id, pageToDelete.id);
      if (res.success) {
        toast.success("Página eliminada");
        fetchPages();
      } else {
        toast.error("Error al eliminar la página");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setPageToDelete(null);
    }
  };

  const headerState = useMemo(
    () => ({
      breadcrumbs: [{ label: "Páginas" }],
      search: {
        value: search,
        onChange: setSearch,
        placeholder: "Buscar páginas...",
      },
      actions: (
        <Button size="sm" onClick={() => navigate("new")}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Añadir Página</span>
          <span className="sm:hidden">Añadir</span>
        </Button>
      ),
    }),
    [search, navigate],
  );

  useSetSitePageHeader(headerState);

  const filteredPages = pages.filter((page) =>
    (page.title || page.name || "").toLowerCase().includes(search.toLowerCase()),
  );

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

  return (
    <div className="flex-1 p-6">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle>Páginas del sitio</CardTitle>
          <CardDescription>
            Crea y administra las páginas visuales de tu sitio web.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No hay páginas encontradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        {page.title || page.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant={page.status === "public" ? "default" : "secondary"}>
                          {page.status === "public" ? "Público" : "Borrador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`${page.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPageToDelete(page)}
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

      <AlertDialog
        open={!!pageToDelete}
        onOpenChange={(open) => !open && setPageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar página?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accin no se puede deshacer. Se eliminarǭ la pǭgina "
              {pageToDelete?.title || pageToDelete?.name}".
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
