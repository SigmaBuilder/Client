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
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [itemToDelete, setItemToDelete] = useState<PortfolioStackItem | null>(null);

  const fetchItems = async () => {
    if (!currentSite?.id) return;
    setIsLoading(true);
    try {
      const res = await api.getPortfolioStack<{ portfolioStack: PortfolioStackItem[] }>(currentSite.id);
      if (res.success && res.data) {
        setItems(res.data.portfolioStack);
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
    fetchItems();
  }, [currentSite?.id]);

  const handleDelete = async () => {
    if (!currentSite?.id || !itemToDelete) return;
    try {
      const res = await api.deletePortfolioStackItem(currentSite.id, itemToDelete.id);
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

  const headerState = useMemo(() => ({
    breadcrumbs: [
      { label: "Portfolio" },
      { label: "Stack" }
    ],
    search: {
      value: search,
      onChange: setSearch,
      placeholder: "Buscar tecnologías...",
    },
    actions: (
      <Button size="sm" onClick={() => navigate("new")}>
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Añadir Tecnología</span>
        <span className="sm:hidden">Añadir</span>
      </Button>
    ),
  }), [search, navigate]);

  useSetSitePageHeader(headerState);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Icono</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
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

      <AlertDialog open={!!itemToDelete} onOpenChange={(open: boolean) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tecnología?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{itemToDelete?.name}".
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
