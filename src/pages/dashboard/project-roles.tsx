import { useOutletContext } from 'react-router-dom';
import { RolesTab } from '@/components/project/RolesTab';
import type { ProjectOutletContext } from '@/layouts/ProjectLayout';

export default function ProjectRolesPage() {
  const { projectId } = useOutletContext<ProjectOutletContext>();
  return <RolesTab projectId={projectId} />;
}
