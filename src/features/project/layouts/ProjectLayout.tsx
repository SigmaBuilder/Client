import { useEffect, useState, useMemo } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Users, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/use-workspace';
import api from '@/lib/api';
import type { Role } from '@/types/project';
import DashboardNotFound from '@/components/shared/pages/dashboard-not-found';
import { useTranslation } from 'react-i18next';

/** Context passed down to child pages via Outlet context */
export interface ProjectOutletContext {
  projectId: string;
  roles: Role[];
  rolesLoading: boolean;
}

export default function ProjectLayout() {
  const { id } = useParams<{ id: string }>();
  const { sites, currentProject, isLoading, error, fetchProjectSites, setCurrentSite } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const TABS = useMemo(() => [
    { key: 'sites',   label: t('projectLayout.tabSites'),           icon: Globe,   path: '' },
    { key: 'members', label: t('projectLayout.tabMembers'),         icon: Users,   path: '/members' },
    { key: 'roles',   label: t('projectLayout.tabRoles'),           icon: Shield,  path: '/roles' },
  ], [t]);

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    setCurrentSite(null);
    if (id && id !== 'site') fetchProjectSites(id);
  }, [id, fetchProjectSites, setCurrentSite]);

  useEffect(() => {
    if (!id || id === 'site') return;
    setRolesLoading(true);
    api.getProjectRoles<{ roles: Role[] }>(id).then(res => {
      if (res.success && res.data) setRoles(res.data.roles);
      setRolesLoading(false);
    });
  }, [id]);

  const basePath = `/dashboard/${id}`;

  const activeTab = TABS.find(t => {
    if (t.path === '') return location.pathname === basePath;
    return location.pathname.startsWith(`${basePath}${t.path}`);
  })?.key ?? 'sites';

  const outletContext: ProjectOutletContext = {
    projectId: id!,
    roles,
    rolesLoading,
  };

  if (!isLoading && !currentProject && error) {
    return <DashboardNotFound />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-6 pb-4 gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </>
          ) : (
            <>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                {currentProject?.name ?? t('projectLayout.defaultProjectName')}
              </h1>
              {currentProject?.description && (
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {currentProject.description}
                </p>
              )}
            </>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Badge variant="outline">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
            {t('projectLayout.statusActive')}
          </Badge>
        </div>
      </div>

      {/* Sticky nav bar */}
      <div className="sticky top-[var(--header-height,56px)] z-10 bg-background border-b border-muted/60">
        <div className="flex items-center px-4 md:px-6 gap-0 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(`${basePath}${tab.path}`)}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors shrink-0',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}
              >
                <Icon className="size-4" />
                {tab.label}
                {tab.key === 'sites' && sites && sites.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{sites.length}</Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-page content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet context={outletContext} />
      </div>
    </div>
  );
}
