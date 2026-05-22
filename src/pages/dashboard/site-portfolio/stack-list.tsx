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
import { useTranslation } from "react-i18next";

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
const { t } = useTranslation();

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
        toast.error(t("sitePortfolioStack.toastLoadError"));
      }
    } catch {
      toast.error(t("sitePortfolioStack.toastConnectError"));
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
        toast.success(t("sitePortfolioStack.toastDeleteSuccess"));
        fetchItems();
      } else {
        toast.error(t("sitePortfolioStack.toastDeleteError"));
      }
    } catch {
      toast.error(t("sitePortfolioStack.toastConnectError"));
    } finally {
      setItemToDelete(null);
    }
  };

const debouncedSetSearch = useDebouncedCallback((val: string) => setSearch(val), 400);

  const headerState = useMemo(
    () => ({
      breadcrumbs: [{ label: t("sitePortfolioStack.breadcrumbPortfolio") }, { label: t("sitePortfolioStack.breadcrumbStack") }],
      search: {
        value: search,
        onChange: debouncedSetSearch,
        placeholder: t("sitePortfolioStack.searchPlaceholder"),
      },
      actions: (
        <Button size="sm" onClick={() => navigate("new")}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t("sitePortfolioStack.addBtnLg")}</span>
          <span className="sm:hidden">{t("sitePortfolioStack.addBtnSm")}</span>
        </Button>
      ),
    }),
    [search, navigate, t],
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

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="text-muted-foreground">{t("sitePortfolioStack.emptyList")}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle>{t("sitePortfolioStack.pageTitle")}</CardTitle>
          <CardDescription>
            {t("sitePortfolioStack.pageDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-15">{t("sitePortfolioStack.colIcon")}</TableHead>
                  <TableHead>{t("sitePortfolioStack.colName")}</TableHead>
                  <TableHead className="text-right">{t("sitePortfolioStack.colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {t("sitePortfolioStack.emptyList")}
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
            {t("sitePortfolioStack.btnPrev")}
          </Button>
          <span>{t("sitePortfolioStack.paginationInfo", { page: currentPage, total: meta.totalPages })}</span>
          <Button size="sm" variant="secondary" onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))} disabled={currentPage === meta.totalPages}>
            {t("sitePortfolioStack.btnNext")}
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open: boolean) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sitePortfolioStack.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sitePortfolioStack.deleteDesc", { name: itemToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("sitePortfolioStack.cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("sitePortfolioStack.deleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
