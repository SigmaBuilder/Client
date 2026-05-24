import { useOutletContext } from 'react-router-dom';
import { useWorkspace } from '@/hooks/use-workspace';
import { SitesTab } from '@/features/project/components/SitesTab';
import type { ProjectOutletContext } from '@/features/project/layouts/ProjectLayout';

export default function ProjectSitesPage() {
  const { projectId } = useOutletContext<ProjectOutletContext>();
  const { sites, isLoading, fetchProjectSites } = useWorkspace();

  return (
    <SitesTab
      sites={sites}
      isLoading={isLoading}
      projectId={projectId}
      onSiteCreated={() => fetchProjectSites(projectId)}
    />
  );
}
