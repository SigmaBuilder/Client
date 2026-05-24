import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Globe, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import type { Site } from "@/types/project";
import { MediaLibraryManager } from "@/components/shared/MediaLibrary/MediaLibraryManager";
import { useSetSitePageHeader } from "@/features/site/components/SitePageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import DashboardNotFound from "@/components/shared/pages/dashboard-not-found";
import { useTranslation } from "react-i18next";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SiteSettings() {
  const { currentSite, currentProject, isLoading, setCurrentSite } =
    useWorkspace();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "public">("draft");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const isPublic = status === "public";
  const originalFaviconUrl = currentSite?.content?.favicon_url ?? "";
  const hasChanges = Boolean(
    currentSite &&
    (name.trim() !== currentSite.name ||
      slug.trim() !== currentSite.slug ||
      status !== (currentSite.status ?? "draft") ||
      faviconUrl !== originalFaviconUrl),
  );

  const headerState = useMemo(
    () => ({
      actions: (
        <>
          <Badge variant={isPublic ? "default" : "secondary"}>
            {isPublic ? t("siteSettings.published") : t("siteSettings.draft")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/dashboard/site/${currentSite?.slug}/media`)
            }
          >
            <ImageIcon data-icon="inline-start" />
            {t("siteSettings.mediaBtn")}
          </Button>
          <Button
            size="sm"
            disabled={!hasChanges || saving}
            onClick={() => void handleSave()}
          >
            {saving && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {t("siteSettings.saveBtn")}
          </Button>
        </>
      ),
    }),
    [currentSite?.slug, hasChanges, isPublic, navigate, saving],
  );

  useSetSitePageHeader(headerState);

  useEffect(() => {
    if (!currentSite) return;

    setName(currentSite.name ?? "");
    setSlug(currentSite.slug ?? "");
    setStatus((currentSite.status as "draft" | "public") ?? "draft");
    setFaviconUrl(currentSite.content?.favicon_url ?? "");
  }, [currentSite]);

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleSlugChange = (value: string) => {
    setSlug(toSlug(value));
  };

  const handleSave = async () => {
    if (!currentSite) return;
    if (!name.trim()) {
      toast.error(t("siteSettings.toastNameRequired"));
      return;
    }
    if (!slug.trim()) {
      toast.error(t("siteSettings.toastSlugRequired"));
      return;
    }

    const previousSlug = currentSite.slug;
    const nextContent = {
      ...(currentSite.content ?? {}),
      favicon_url: faviconUrl || null,
    };

    setSaving(true);
    try {
      const res = await api.updateSite<{ site: Site }>(currentSite.id, {
        name: name.trim(),
        slug: slug.trim(),
        status,
        content: nextContent,
      });

      if (res.success && res.data?.site) {
        setCurrentSite(res.data.site);
        toast.success(t("siteSettings.toastUpdateSuccess"));

        if (res.data.site.slug !== previousSlug) {
          navigate(`/dashboard/site/${res.data.site.slug}`, { replace: true });
        }
      } else {
        toast.error(res.error || t("siteSettings.toastUpdateError"));
      }
    } catch {
      toast.error(t("siteSettings.toastErrorConnect"));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!currentSite) {
    return (
      <div className="p-8">
        <DashboardNotFound />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground ring-1 ring-foreground/10">
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt={t("siteSettings.faviconAlt")}
                    className="size-full object-cover"
                  />
                ) : (
                  <Globe />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <CardTitle className="text-2xl">
                  {currentSite.name || currentSite.slug}
                </CardTitle>
                <CardDescription>
                  {t("siteSettings.cardDesc", { project: currentProject?.name || t("siteSettings.thisProject") })}
                </CardDescription>
              </div>
            </div>
            <CardAction>
              <Badge variant={isPublic ? "default" : "secondary"}>
                {isPublic ? t("siteSettings.published") : t("siteSettings.draft")}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title={t("siteSettings.infoTemplate")} value={currentSite.template_type} />
        <InfoCard title={t("siteSettings.infoSlug")} value={`/${currentSite.slug}`} />
        <InfoCard title={t("siteSettings.infoCreated")} value={formatDate(currentSite.created_at)} />
        <InfoCard
          title={t("siteSettings.infoUpdated")}
          value={formatDate(currentSite.updated_at)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>{t("siteSettings.siteInfoTitle")}</CardTitle>
            <CardDescription>
              {t("siteSettings.siteInfoDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="site-name">{t("siteSettings.nameLabel")}</FieldLabel>
                <Input
                  id="site-name"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  disabled={saving}
                  placeholder={t("siteSettings.namePlaceholder")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="site-slug">{t("siteSettings.slugLabel")}</FieldLabel>
                <Input
                  id="site-slug"
                  value={slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  disabled={saving}
                  placeholder={t("siteSettings.slugPlaceholder")}
                />
                <FieldDescription>
                  {t("siteSettings.slugHelp", { slug: slug || t("siteSettings.slugPlaceholder") })}
                </FieldDescription>
              </Field>

              <Field orientation="horizontal">
                <Switch
                  checked={isPublic}
                  disabled={saving}
                  aria-label={t("siteSettings.statusAria")}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? "public" : "draft")
                  }
                />
                <FieldContent>
                  <FieldTitle>
                    {isPublic ? t("siteSettings.statusPublishedTitle") : t("siteSettings.statusDraftTitle")}
                  </FieldTitle>
                  <FieldDescription>
                    {isPublic
                      ? t("siteSettings.statusPublishedDesc")
                      : t("siteSettings.statusDraftDesc")}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              variant="outline"
              disabled={!hasChanges || saving}
              onClick={() => {
                setName(currentSite.name ?? "");
                setSlug(currentSite.slug ?? "");
                setStatus(
                  (currentSite.status as "draft" | "public") ?? "draft",
                );
                setFaviconUrl(currentSite.content?.favicon_url ?? "");
              }}
            >
              {t("siteSettings.discardBtn")}
            </Button>
            <Button
              disabled={!hasChanges || saving}
              onClick={() => void handleSave()}
            >
              {saving && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              {t("siteSettings.saveBtn")}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("siteSettings.faviconTitle")}</CardTitle>
            <CardDescription>
              {t("siteSettings.faviconDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10">
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt={t("siteSettings.faviconSelected")}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {faviconUrl ? t("siteSettings.faviconSelected") : t("siteSettings.faviconNone")}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {faviconUrl || t("siteSettings.faviconHelp")}
                </p>
              </div>
            </div>

            <MediaLibraryManager
              projectId={currentSite.project_id || currentProject?.id || ""}
              siteId={currentSite.id}
              onSelect={(asset) => setFaviconUrl(asset.file_url)}
              trigger={
                <Button
                  variant="outline"
                  disabled={
                    saving || !(currentSite.project_id || currentProject?.id)
                  }
                >
                  <ImageIcon data-icon="inline-start" />
                  {t("siteSettings.changeFaviconBtn")}
                </Button>
              }
            />

            {faviconUrl && (
              <Button
                variant="ghost"
                disabled={saving}
                onClick={() => setFaviconUrl("")}
              >
                {t("siteSettings.removeFaviconBtn")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="truncate text-xl font-semibold capitalize">{value}</p>
      </CardContent>
    </Card>
  );
}
