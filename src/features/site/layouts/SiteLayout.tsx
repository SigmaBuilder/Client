import { useEffect, useState, useRef } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { SitePageHeaderProvider } from '@/features/site/components/SitePageHeader';
import DashboardNotFound from '@/components/shared/pages/dashboard-not-found';
import { api, SITE_VIEWER_URL } from '@/lib/api';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function SiteLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { currentSite, isLoading, error, fetchSiteBySlug, setCurrentSite } = useWorkspace();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (slug) fetchSiteBySlug(slug);
  }, [slug, fetchSiteBySlug]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsPopoverOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPopoverOpen(false);
    }, 200);
  };

  const handleQuickPublish = async () => {
    if (!currentSite) return;
    setIsPublishing(true);
    try {
      const res = await api.updateSite<{ site: any }>(currentSite.id, {
        status: 'public',
      });
      if (res.success && res.data?.site) {
        setCurrentSite(res.data.site);
        toast.success('Sitio publicado correctamente.');
      } else {
        toast.error(res.error || 'Error al publicar el sitio.');
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between px-6 py-3 gap-4 border-b">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="h-5 w-5 shrink-0" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !currentSite) {
    return <DashboardNotFound />;
  }

  return (
    <SitePageHeaderProvider
      renderSlot={(header) => (
        <div className="flex flex-col h-full min-h-0">
          {/* Compact header */}
          <div className={cn(
            "sticky top-[var(--header-height)] z-30 items-center justify-between px-4 sm:px-6 py-1.5 sm:py-3 gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur-md shrink-0 h-11 sm:h-14",
            header ? "flex" : "hidden sm:flex"
          )}>
            <div className="hidden sm:flex items-center gap-2 min-w-0 shrink-0">
              <Globe className="h-5 w-5 text-primary shrink-0" />
              <h1 className="text-base font-semibold truncate">
                {currentSite.name || currentSite.slug}
              </h1>
            </div>

            <div className="flex flex-1 items-center justify-between sm:justify-end gap-2 sm:gap-4 min-w-0">
              {/* Page header injected by child pages (breadcrumbs, search, actions) */}
              {header}
              
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="inline-block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 sm:w-auto sm:px-3 shrink-0"
                      asChild
                    >
                      <a
                        href={
                          currentSite.status === 'public'
                            ? `${SITE_VIEWER_URL}/${currentSite.slug}`
                            : undefined
                        }
                        onClick={(e) => {
                          if (currentSite.status !== 'public') {
                            e.preventDefault();
                            setIsPopoverOpen(true);
                          }
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          currentSite.status !== 'public' && "cursor-pointer"
                        )}
                      >
                        <Globe className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">Ver sitio</span>
                      </a>
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  align="end"
                  className="w-80 p-4 border border-border bg-popover shadow-xl rounded-xl animate-in fade-in-0 zoom-in-95 duration-150"
                  sideOffset={8}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-semibold text-sm">Estado de publicación</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full animate-pulse",
                            currentSite.status === 'public'
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                              : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider",
                            currentSite.status === 'public'
                              ? "text-emerald-500"
                              : "text-amber-500"
                          )}
                        >
                          {currentSite.status === 'public' ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentSite.status === 'public'
                        ? "Tu sitio está publicado y es accesible públicamente."
                        : "Tu sitio está en borrador. Debes publicarlo para que sea visible públicamente."}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      {currentSite.status === 'public' ? (
                        <Button size="sm" className="w-full h-8 gap-1.5" asChild>
                          <a
                            href={`${SITE_VIEWER_URL}/${currentSite.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            Ver sitio público
                          </a>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full h-8 gap-1.5"
                          onClick={handleQuickPublish}
                          disabled={isPublishing}
                        >
                          {isPublishing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Globe className="h-3.5 w-3.5" />
                          )}
                          Publicar sitio ahora
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto relative">
            <Outlet />
          </div>
        </div>
      )}
    >
      {/* Child pages */}
    </SitePageHeaderProvider>
  );
}
