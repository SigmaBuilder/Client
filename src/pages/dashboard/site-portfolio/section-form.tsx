import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function PortfolioSectionForm() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const isEditing = !!sectionId;
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    sort_order: 0,
    subtitle: "",
    description: "",
  });

  useEffect(() => {
    if (isEditing && currentSite?.id) {
      const fetchSection = async () => {
        try {
          const res = await api.getPortfolioSection<{ portfolioSection: any }>(currentSite.id, sectionId);
          if (res.success && res.data) {
            const content = res.data.portfolioSection.content || {};
            setFormData({
              title: res.data.portfolioSection.title || "",
              sort_order: res.data.portfolioSection.sort_order || 0,
              subtitle: content.subtitle || "",
              description: content.description || "",
            });
          } else {
            toast.error(t("sitePortfolioSectionForm.toastLoadError"));
            navigate(`/dashboard/site/${currentSite.slug}/portfolio/sections`);
          }
        } catch {
          toast.error(t("sitePortfolioSectionForm.toastConnectError"));
        } finally {
          setIsLoading(false);
        }
      };
      fetchSection();
    }
  }, [currentSite?.id, sectionId, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sort_order' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    if (!currentSite?.id) return;
    if (!formData.title.trim()) {
      toast.error(t("sitePortfolioSectionForm.toastTitleRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        sort_order: formData.sort_order,
        content: {
          subtitle: formData.subtitle,
          description: formData.description,
        }
      };

      let res;
      if (isEditing) {
        res = await api.updatePortfolioSection(currentSite.id, sectionId, payload);
      } else {
        res = await api.createPortfolioSection(currentSite.id, payload);
      }

      if (res.success) {
        toast.success(isEditing ? t("sitePortfolioSectionForm.toastSaveSuccessEdit") : t("sitePortfolioSectionForm.toastSaveSuccessNew"));
        navigate(`/dashboard/site/${currentSite.slug}/portfolio/sections`);
      } else {
        toast.error(res.error || t("sitePortfolioSectionForm.toastSaveError"));
      }
    } catch {
      toast.error(t("sitePortfolioSectionForm.toastConnectError"));
    } finally {
      setIsSaving(false);
    }
  };

  const headerState = useMemo(() => ({
    breadcrumbs: [
      { label: t("sitePortfolioSectionForm.breadcrumbPortfolio") },
      { label: t("sitePortfolioSectionForm.breadcrumbSections"), onClick: () => navigate(`/dashboard/site/${currentSite?.slug}/portfolio/sections`) },
      { label: isEditing ? t("sitePortfolioSectionForm.breadcrumbEdit") : t("sitePortfolioSectionForm.breadcrumbNew") }
    ],
    actions: (
      <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
        <Save className="h-4 w-4 mr-2" />
        {t("sitePortfolioSectionForm.saveBtn")}
      </Button>
    ),
  }), [isEditing, navigate, handleSave, isSaving, isLoading, currentSite?.slug, t]);

  useSetSitePageHeader(headerState);

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/site/${currentSite?.slug}/portfolio/sections`)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("sitePortfolioSectionForm.backBtn")}
        </Button>
        <h2 className="text-xl font-semibold tracking-tight">
          {isEditing ? t("sitePortfolioSectionForm.titleEdit") : t("sitePortfolioSectionForm.titleNew")}
        </h2>
      </div>

      <div className="space-y-6 bg-card border rounded-md p-6">
        <div className="space-y-2">
          <Label htmlFor="title">{t("sitePortfolioSectionForm.labelTitle")}</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={t("sitePortfolioSectionForm.placeholderTitle")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort_order">{t("sitePortfolioSectionForm.labelSort")}</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">{t("sitePortfolioSectionForm.labelSubtitle")}</Label>
          <Input
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder={t("sitePortfolioSectionForm.placeholderSubtitle")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t("sitePortfolioSectionForm.labelDesc")}</Label>
          <textarea
            id="description"
            name="description"
            className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.description}
            onChange={handleChange}
            placeholder={t("sitePortfolioSectionForm.placeholderDesc")}
          />
        </div>
      </div>
    </div>
  );
}
