import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Globe, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import type { Site } from "@/types/project";
import { MediaLibraryManager } from "@/components/shared/MediaLibrary/MediaLibraryManager";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import DashboardNotFound from "./not-found";

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

export default function SiteDashboard() {
  const { currentSite, currentProject, isLoading, setCurrentSite } = useWorkspace();
  const navigate = useNavigate();

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

  const headerState = useMemo(() => ({
    actions: (
      <>
        <Badge variant={isPublic ? "default" : "secondary"}>
          {isPublic ? "Publicado" : "Borrador"}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/dashboard/site/${currentSite?.slug}/media`)}
        >
          <ImageIcon data-icon="inline-start" />
          Medios
        </Button>
        <Button size="sm" disabled={!hasChanges || saving} onClick={() => void handleSave()}>
          {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
          Guardar cambios
        </Button>
      </>
    ),
  }), [currentSite?.slug, hasChanges, isPublic, navigate, saving]);

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
      toast.error("El nombre del sitio es obligatorio");
      return;
    }
    if (!slug.trim()) {
      toast.error("El slug público es obligatorio");
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
        toast.success("Sitio actualizado correctamente");

        if (res.data.site.slug !== previousSlug) {
          navigate(`/dashboard/site/${res.data.site.slug}`, { replace: true });
        }
      } else {
        toast.error(res.error || "No se pudo actualizar el sitio");
      }
    } catch {
      toast.error("Error de conexión");
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/dashboard/${currentSite.project_id}`)}
          className="w-fit px-0"
        >
          <ArrowLeft data-icon="inline-start" />
          Volver al proyecto
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground ring-1 ring-foreground/10">
                {faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon del sitio" className="size-full object-cover" />
                ) : (
                  <Globe />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <CardTitle className="text-2xl">{currentSite.name || currentSite.slug}</CardTitle>
                <CardDescription>
                  Inicio del sitio dentro de {currentProject?.name || "este proyecto"}. Revisa su información pública y ajustes principales.
                </CardDescription>
              </div>
            </div>
            <CardAction>
              <Badge variant={isPublic ? "default" : "secondary"}>
                {isPublic ? "Publicado" : "Borrador"}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Template" value={currentSite.template_type} />
        <InfoCard title="Slug público" value={`/${currentSite.slug}`} />
        <InfoCard title="Creado" value={formatDate(currentSite.created_at)} />
        <InfoCard title="Actualizado" value={formatDate(currentSite.updated_at)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Información del sitio</CardTitle>
            <CardDescription>
              Cambia el nombre, la URL pública y el estado de publicación del site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="site-name">Nombre</FieldLabel>
                <Input
                  id="site-name"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  disabled={saving}
                  placeholder="Nombre del sitio"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="site-slug">Slug público</FieldLabel>
                <Input
                  id="site-slug"
                  value={slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  disabled={saving}
                  placeholder="mi-sitio"
                />
                <FieldDescription>
                  Solo letras minúsculas, números y guiones. Se usará en /dashboard/site/{slug || "mi-sitio"}.
                </FieldDescription>
              </Field>

              <Field orientation="horizontal">
                <Switch
                  checked={isPublic}
                  disabled={saving}
                  aria-label="Cambiar estado de publicación"
                  onCheckedChange={(checked) => setStatus(checked ? "public" : "draft")}
                />
                <FieldContent>
                  <FieldTitle>{isPublic ? "Sitio publicado" : "Sitio en borrador"}</FieldTitle>
                  <FieldDescription>
                    {isPublic
                      ? "El sitio está marcado como público."
                      : "El sitio no está publicado todavía."}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" disabled={!hasChanges || saving} onClick={() => {
              setName(currentSite.name ?? "");
              setSlug(currentSite.slug ?? "");
              setStatus((currentSite.status as "draft" | "public") ?? "draft");
              setFaviconUrl(currentSite.content?.favicon_url ?? "");
            }}>
              Descartar
            </Button>
            <Button disabled={!hasChanges || saving} onClick={() => void handleSave()}>
              {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              Guardar cambios
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favicon</CardTitle>
            <CardDescription>
              El icono aparecerá en la lista de sitios del proyecto y en las vistas que usen la metadata del site.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10">
                {faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon seleccionado" className="size-full object-cover" />
                ) : (
                  <ImageIcon />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{faviconUrl ? "Icono seleccionado" : "Sin favicon"}</p>
                <p className="truncate text-sm text-muted-foreground">{faviconUrl || "Selecciona una imagen desde la media library."}</p>
              </div>
            </div>

            <MediaLibraryManager
              projectId={currentSite.project_id || currentProject?.id || ""}
              siteId={currentSite.id}
              onSelect={(asset) => setFaviconUrl(asset.file_url)}
              trigger={(
                <Button variant="outline" disabled={saving || !(currentSite.project_id || currentProject?.id)}>
                  <ImageIcon data-icon="inline-start" />
                  Cambiar favicon
                </Button>
              )}
            />

            {faviconUrl && (
              <Button variant="ghost" disabled={saving} onClick={() => setFaviconUrl("")}>
                Quitar favicon
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
