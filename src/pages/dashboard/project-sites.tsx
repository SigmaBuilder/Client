import { useOutletContext } from 'react-router-dom';
import { useWorkspace } from '@/hooks/use-workspace';
import { SitesTab } from '@/components/project/SitesTab';
import type { ProjectOutletContext } from '@/layouts/ProjectLayout';

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
