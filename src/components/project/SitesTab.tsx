import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import type { Site } from '@/types/project';

interface SitesTabProps {
  sites: Site[] | null;
  isLoading: boolean;
  projectId: string;
  onSiteCreated?: () => void;
}

function SiteCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

/** Converts a name to a URL-friendly slug */
function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function SitesTab({ sites, isLoading, projectId, onSiteCreated }: SitesTabProps) {
  const navigate = useNavigate();

  // Create site dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteSlug, setSiteSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleNameChange = (value: string) => {
    setSiteName(value);
    if (!slugTouched) {
      setSiteSlug(toSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSiteSlug(toSlug(value));
  };

  const openCreateDialog = () => {
    setSiteName('');
    setSiteSlug('');
    setSlugTouched(false);
    setCreateOpen(true);
  };

  const handleCreateSite = async () => {
    if (!siteName.trim()) {
      toast.error('El nombre del sitio es obligatorio');
      return;
    }
    if (!siteSlug.trim()) {
      toast.error('El slug del sitio es obligatorio');
      return;
    }
    setCreating(true);
    const res = await api.createProjectSite<{ site: Site }>(projectId, {
      name: siteName.trim(),
      slug: siteSlug.trim(),
    });
    if (res.success && res.data) {
      toast.success(`Sitio "${res.data.site.name}" creado correctamente`);
      setCreateOpen(false);
      onSiteCreated?.();
    } else {
      toast.error(res.error ?? 'Error creando el sitio');
    }
    setCreating(false);
  };

  if (isLoading || sites === null) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => <SiteCardSkeleton key={i} />)}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl">
          <Globe className="size-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">Sin sitios aún</p>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Crea el primer sitio de este proyecto para empezar.
          </p>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus data-icon="inline-start" />
            Crear sitio
          </Button>
        </div>

        <CreateSiteDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          siteName={siteName}
          siteSlug={siteSlug}
          creating={creating}
          onNameChange={handleNameChange}
          onSlugChange={handleSlugChange}
          onSubmit={handleCreateSite}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {sites.map((site) => (
          <Card
            key={site.id}
            className="cursor-pointer"
            onClick={() => navigate(`/dashboard/site/${site.slug}`)}
          >
            <CardHeader>
              <CardTitle className="truncate">{site.name || site.slug}</CardTitle>
              <CardDescription className="truncate">{site.slug}</CardDescription>
              <CardAction>
                <Badge variant="secondary">Activo</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(site.updated_at).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </p>
            </CardContent>
          </Card>
        ))}

        <button
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed min-h-[160px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          onClick={openCreateDialog}
        >
          <Plus className="size-5" />
          <span className="text-sm">Nuevo sitio</span>
        </button>
      </div>

      <CreateSiteDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        siteName={siteName}
        siteSlug={siteSlug}
        creating={creating}
        onNameChange={handleNameChange}
        onSlugChange={handleSlugChange}
        onSubmit={handleCreateSite}
      />
    </>
  );
}

interface CreateSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteName: string;
  siteSlug: string;
  creating: boolean;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubmit: () => void;
}

function CreateSiteDialog({
  open, onOpenChange, siteName, siteSlug, creating,
  onNameChange, onSlugChange, onSubmit,
}: CreateSiteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo sitio</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="site-name">Nombre del sitio</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={e => onNameChange(e.target.value)}
              disabled={creating}
              placeholder="Mi sitio web"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="site-slug">Slug (URL)</Label>
            <div className="flex items-center gap-0 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-ring">
              <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r select-none">
                /
              </span>
              <input
                id="site-slug"
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none disabled:opacity-50"
                value={siteSlug}
                onChange={e => onSlugChange(e.target.value)}
                disabled={creating}
                placeholder="mi-sitio-web"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Solo letras minúsculas, números y guiones.
            </p>
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={onSubmit} disabled={creating}>
            {creating && <Loader2 className="size-3.5 animate-spin" />}
            Crear sitio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
