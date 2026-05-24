import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/features/site/components/SitePageHeader";
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

interface PortfolioSection {
  id: string;
  title: string;
  sort_order: number;
}

export default function PortfolioSectionsList() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(15);
  const [sectionToDelete, setSectionToDelete] =
  useState<PortfolioSection | null>(null);
  const { t } = useTranslation();

  const fetchSections = async (searchValue = search, page = currentPage, perPage = limit) => {
    if (!currentSite?.id) return;
    setIsLoading(true);
    try {
      const res = await api.getPortfolioSections<any>(currentSite.id, page, perPage, searchValue);
      if (res.success && res.data) {
        if (res.meta) {
          setMeta(res.meta);
        } else if (res.data.meta) {
          setMeta(res.data.meta);
        }
        const dataArray =
          Array.isArray(res.data?.data) ? res.data.data :
          Array.isArray(res.data?.sections) ? res.data.sections :
          Array.isArray(res.data?.portfolioSections) ? res.data.portfolioSections :
          Array.isArray(res.data) ? res.data : [];
        setSections(dataArray);
      } else {
        toast.error(t("sitePortfolioSections.toastLoadError"));
      }
    } catch {
      toast.error(t("sitePortfolioSections.toastConnectError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [currentSite?.id]);

  useEffect(() => {
    fetchSections(search, currentPage, limit);
  }, [currentSite?.id, search, currentPage, limit]);

  const handleDelete = async () => {
    if (!currentSite?.id || !sectionToDelete) return;
    try {
      const res = await api.deletePortfolioSection(
        currentSite.id,
        sectionToDelete.id,
      );
      if (res.success) {
        toast.success(t("sitePortfolioSections.toastDeleteSuccess"));
        fetchSections();
      } else {
        toast.error(t("sitePortfolioSections.toastDeleteError"));
      }
    } catch {
      toast.error(t("sitePortfolioSections.toastConnectError"));
    } finally {
      setSectionToDelete(null);
    }
  };

  const debouncedSetSearch = useDebouncedCallback((val: string) => setSearch(val), 400);

  const headerState = useMemo(
    () => ({
      breadcrumbs: [{ label: t("sitePortfolioSections.breadcrumbPortfolio") }, { label: t("sitePortfolioSections.breadcrumbSections") }],
      search: {
        value: search,
        onChange: debouncedSetSearch,
        placeholder: t("sitePortfolioSections.searchPlaceholder"),
      },
      actions: (
        <Button size="sm" onClick={() => navigate("new")}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t("sitePortfolioSections.addBtnLg")}</span>
          <span className="sm:hidden">{t("sitePortfolioSections.addBtnSm")}</span>
        </Button>
      ),
    }),
    [search, navigate, t],
  );

  useSetSitePageHeader(headerState);

// Just use the fetched data (server-side filter):
const filteredSections = sections;


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

  // Empty state for paginated result
  if (!isLoading && sections.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="text-muted-foreground">{t("sitePortfolioSections.emptyList")}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle>{t("sitePortfolioSections.pageTitle")}</CardTitle>
          <CardDescription>
            {t("sitePortfolioSections.pageDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sitePortfolioSections.colTitle")}</TableHead>
                  <TableHead className="w-25">{t("sitePortfolioSections.colOrder")}</TableHead>
                  <TableHead className="text-right">{t("sitePortfolioSections.colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {t("sitePortfolioSections.emptyList")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        {section.title}
                      </TableCell>
                      <TableCell>{section.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`${section.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSectionToDelete(section)}
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
            {t("sitePortfolioSections.btnPrev")}
          </Button>
          <span>{t("sitePortfolioSections.paginationInfo", { page: currentPage, total: meta.totalPages })}</span>
          <Button size="sm" variant="secondary" onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))} disabled={currentPage === meta.totalPages}>
            {t("sitePortfolioSections.btnNext")}
          </Button>
        </div>
      )}

      <AlertDialog
        open={!!sectionToDelete}
        onOpenChange={(open: boolean) => !open && setSectionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sitePortfolioSections.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sitePortfolioSections.deleteDesc", { name: sectionToDelete?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("sitePortfolioSections.cancelBtn")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("sitePortfolioSections.deleteBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
