import { useOutletContext } from 'react-router-dom';
import { RolesTab } from '@/features/project/components/RolesTab';
import type { ProjectOutletContext } from '@/features/project/layouts/ProjectLayout';

export default function ProjectRolesPage() {
  const { projectId } = useOutletContext<ProjectOutletContext>();
  return <RolesTab projectId={projectId} />;
}
