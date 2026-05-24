import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/features/site/components/SitePageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Home, MoreVertical } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useTranslation } from "react-i18next";

interface SitePage {
  id: string;
  name?: string;
  title?: string;
  slug: string;
  status: "draft" | "public";
  is_home: boolean;
}

export default function PagesList() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
const [pages, setPages] = useState<SitePage[]>([]);
const [meta, setMeta] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);
const [search, setSearch] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [limit] = useState(10);
const [pageToDelete, setPageToDelete] = useState<SitePage | null>(null);
const { t } = useTranslation();

  const fetchPages = async (searchValue = search, page = currentPage, perPage = limit) => {
    if (!currentSite?.id) return;
    setIsLoading(true);
    try {
      const res = await api.getSitePages<any>(currentSite.id, page, perPage, searchValue);
      if (res.success && res.data) {
        if (res.meta) {
          setMeta(res.meta);
        } else if (res.data.meta) {
          setMeta(res.data.meta);
        }
        const dataArray =
          Array.isArray(res.data?.data) ? res.data.data :
          Array.isArray(res.data?.pages) ? res.data.pages :
          Array.isArray(res.data) ? res.data : [];
        setPages(dataArray);
      } else {
        toast.error(t("sitePagesList.toastLoadError"));
      }
    } catch {
      toast.error(t("sitePagesList.toastConnectError"));
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    setCurrentPage(1);
  }, [currentSite?.id]);

  useEffect(() => {
    fetchPages(search, currentPage, limit);
  }, [currentSite?.id, search, currentPage, limit]);

  const handleSetHome = async (pageId: string) => {
    if (!currentSite?.id) return;
    const loadingToast = toast.loading(t("sitePagesList.toastSetHomeLoading"));
    try {
      const res = await api.setSitePageAsHome(currentSite.id, pageId);
      if (res.success) {
        toast.success(t("sitePagesList.toastSetHomeSuccess"), { id: loadingToast });
        fetchPages(); // Refrescar la lista para ver los cambios
      } else {
        toast.error(res.error || t("sitePagesList.toastSetHomeError"), { id: loadingToast });
      }
    } catch {
      toast.error(t("sitePagesList.toastConnectError"), { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    if (!currentSite?.id || !pageToDelete) return;
    try {
      const res = await api.deleteSitePage(currentSite.id, pageToDelete.id);
      if (res.success) {
        toast.success(t("sitePagesList.toastDeleteSuccess"));
        fetchPages();
      } else {
        toast.error(res.error || t("sitePagesList.toastDeleteError"));
      }
    } catch {
      toast.error(t("sitePagesList.toastConnectError"));
    } finally {
      setPageToDelete(null);
    }
  };

const debouncedSetSearch = useDebouncedCallback((val: string) => setSearch(val), 400);

const headerState = useMemo(
    () => ({
      breadcrumbs: [{ label: t("sitePagesList.breadcrumb") }],
      search: {
        value: search,
        onChange: debouncedSetSearch,
        placeholder: t("sitePagesList.searchPlaceholder"),
      },
      actions: (
        <Button size="sm" onClick={() => navigate("new")}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t("sitePagesList.addPageLg")}</span>
          <span className="sm:hidden">{t("sitePagesList.addPageSm")}</span>
        </Button>
      ),
    }),
    [search, navigate],
  );

  useSetSitePageHeader(headerState);

  // Server-side search; just use the fetched data:
const filteredPages = pages;

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

  // Empty State for paginated query
  if (!isLoading && pages.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="text-muted-foreground">{t("sitePagesList.noPages")}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle>{t("sitePagesList.title")}</CardTitle>
          <CardDescription>
            {t("sitePagesList.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sitePagesList.colName")}</TableHead>
                  <TableHead>{t("sitePagesList.colPath")}</TableHead>
                  <TableHead>{t("sitePagesList.colStatus")}</TableHead>
                  <TableHead className="text-right">{t("sitePagesList.colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {t("sitePagesList.noPages")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {page.title || page.name}
                          {page.is_home && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
                              <Home className="w-3 h-3 mr-1" /> {t("sitePagesList.badgeHome")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {page.is_home ? '/' : `/${page.slug}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.status === "public" ? "default" : "secondary"}>
                          {page.status === "public" ? t("sitePagesList.badgePublic") : t("sitePagesList.badgeDraft")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`${page.id}/edit`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("sitePagesList.actionEdit")}
                            </DropdownMenuItem>
                            {!page.is_home && (
                              <DropdownMenuItem onClick={() => handleSetHome(page.id)}>
                                <Home className="h-4 w-4 mr-2" />
                                {t("sitePagesList.actionSetHome")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setPageToDelete(page)}
                              disabled={page.is_home}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("sitePagesList.actionDelete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            {t("sitePagesList.btnPrev")}
          </Button>
          <span>{t("sitePagesList.paginationInfo", { page: currentPage, total: meta.totalPages })}</span>
          <Button size="sm" variant="secondary" onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))} disabled={currentPage === meta.totalPages}>
            {t("sitePagesList.btnNext")}
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!pageToDelete}
        onOpenChange={(open) => !open && setPageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sitePagesList.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sitePagesList.deleteDesc", { name: pageToDelete?.title || pageToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("sitePagesList.deleteCancel")}</AlertDialogCancel>
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
