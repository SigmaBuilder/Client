import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 gap-2 sm:gap-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <Globe className="h-5 w-5 text-primary shrink-0" />
              <h1 className="text-base font-semibold truncate">
                {currentSite.name || currentSite.slug}
              </h1>
            </div>

            <div className="flex flex-1 items-center justify-end gap-4 min-w-0">
              {/* Page header injected by child pages (breadcrumbs, search, actions) */}
              {header}
              
              <Button variant="outline" size="sm" asChild>
                <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                  Abrir sitio
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
