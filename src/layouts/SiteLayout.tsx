import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { SitePageHeaderProvider } from '@/components/site/SitePageHeader';
import DashboardNotFound from '../pages/dashboard/not-found';

export default function SiteLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { currentSite, isLoading, error, fetchSiteBySlug } = useWorkspace();

  useEffect(() => {
    if (slug) fetchSiteBySlug(slug);
  }, [slug, fetchSiteBySlug]);

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
            "items-center justify-between px-4 sm:px-6 py-1.5 sm:py-3 gap-2 sm:gap-4 border-b bg-background shrink-0 h-11 sm:h-14",
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
              
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3 shrink-0" asChild>
                <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Abrir sitio</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      )}
    >
      {/* Child pages */}
    </SitePageHeaderProvider>
  );
}
