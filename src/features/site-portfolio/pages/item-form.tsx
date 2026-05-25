import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/features/site/components/SitePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft, ImagePlus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaLibraryManager } from "@/components/shared/MediaLibrary/MediaLibraryManager";
import { useTranslation } from "react-i18next";

export default function PortfolioItemForm() {
  const { currentSite, currentProject } = useWorkspace();
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEditing = !!itemId;
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    live_url: "",
    repository_url: "",
    sort_order: 0,
  });

  const itemsPath = `/dashboard/site/${currentSite?.slug}/portfolio/items`;

  useEffect(() => {
    if (isEditing && currentSite?.id && itemId) {
      const fetchItem = async () => {
        try {
          const res = await api.getPortfolioItem<{ portfolioItem: any }>(
            currentSite.id,
            itemId,
          );
          if (res.success && res.data) {
            const item = res.data.portfolioItem;
            setFormData({
              title: item.title || "",
              description: item.description || "",
              image_url: item.image_url || "",
              live_url: item.live_url || "",
              repository_url: item.repository_url || "",
              sort_order: item.sort_order || 0,
            });
          } else {
            toast.error(t("sitePortfolioItemForm.toastLoadError"));
            navigate(itemsPath);
          }
        } catch {
          toast.error(t("sitePortfolioItemForm.toastConnectError"));
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [currentSite?.id, itemId, isEditing, navigate, itemsPath]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "sort_order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleMediaSelect = useCallback((asset: { file_url: string }) => {
    setFormData((prev) => ({ ...prev, image_url: asset.file_url }));
  }, []);

  const handleSave = async () => {
    if (!currentSite?.id) return;
    if (!formData.title.trim()) {
      toast.error(t("sitePortfolioItemForm.toastTitleRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
        live_url: formData.live_url || undefined,
        repository_url: formData.repository_url || undefined,
        sort_order: formData.sort_order,
      };

      let res;
      if (isEditing && itemId) {
        res = await api.updatePortfolioItem(currentSite.id, itemId, payload);
      } else {
        res = await api.createPortfolioItem(currentSite.id, payload);
      }

      if (res.success) {
        toast.success(isEditing ? t("sitePortfolioItemForm.toastSaveSuccessEdit") : t("sitePortfolioItemForm.toastSaveSuccessNew"));
        navigate(itemsPath);
      } else {
        toast.error(res.error || t("sitePortfolioItemForm.toastSaveError"));
      }
    } catch {
      toast.error(t("sitePortfolioItemForm.toastConnectError"));
    } finally {
      setIsSaving(false);
    }
  };

  const headerState = useMemo(
    () => ({
      breadcrumbs: [
        { label: t("sitePortfolioItemForm.breadcrumbPortfolio") },
        { label: t("sitePortfolioItemForm.breadcrumbProjects"), onClick: () => navigate(itemsPath) },
        { label: isEditing ? t("sitePortfolioItemForm.breadcrumbEdit") : t("sitePortfolioItemForm.breadcrumbNew") },
      ],
      actions: (
        <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {t("sitePortfolioItemForm.saveBtn")}
        </Button>
      ),
    }),
    [isEditing, navigate, handleSave, isSaving, isLoading, itemsPath, t],
  );

  useSetSitePageHeader(headerState);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6 w-full">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-6 max-w-4xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(itemsPath)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("sitePortfolioItemForm.backBtn")}
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              {isEditing ? t("sitePortfolioItemForm.titleEdit") : t("sitePortfolioItemForm.titleNew")}
            </h2>
          </div>
        </div>

        <div className="space-y-8 bg-card border border-border/50 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title">{t("sitePortfolioItemForm.labelTitle")}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t("sitePortfolioItemForm.placeholderTitle")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("sitePortfolioItemForm.labelDesc")}</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-30 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("sitePortfolioItemForm.placeholderDesc")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("sitePortfolioItemForm.labelImage")}</Label>
            {formData.image_url ? (
              <div className="relative rounded-md border overflow-hidden group">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <MediaLibraryManager
                    projectId={currentProject?.id || ""}
                    siteId={currentSite?.id}
                    onSelect={handleMediaSelect}
                    trigger={
                      <Button variant="secondary" size="sm" type="button">
                        {t("sitePortfolioItemForm.btnChangeImage")}
                      </Button>
                    }
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, image_url: "" }))
                    }
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <MediaLibraryManager
                projectId={currentProject?.id || ""}
                siteId={currentSite?.id}
                onSelect={handleMediaSelect}
                trigger={
                  <button
                    type="button"
                    className="w-full flex flex-col items-center justify-center h-32 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 transition-colors gap-2 text-muted-foreground"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">{t("sitePortfolioItemForm.btnSelectLibrary")}</span>
                  </button>
                }
              />
            )}
            <Input
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder={t("sitePortfolioItemForm.placeholderImage")}
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live_url">{t("sitePortfolioItemForm.labelLiveUrl")}</Label>
            <Input
              id="live_url"
              name="live_url"
              value={formData.live_url}
              onChange={handleChange}
              placeholder={t("sitePortfolioItemForm.placeholderLiveUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository_url">{t("sitePortfolioItemForm.labelRepoUrl")}</Label>
            <Input
              id="repository_url"
              name="repository_url"
              value={formData.repository_url}
              onChange={handleChange}
              placeholder={t("sitePortfolioItemForm.placeholderRepoUrl")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">{t("sitePortfolioItemForm.labelSort")}</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
