import { useOutletContext } from 'react-router-dom';
import { MembersTab } from '@/features/project/components/MembersTab';
import type { ProjectOutletContext } from '@/features/project/layouts/ProjectLayout';

export default function ProjectMembersPage() {
  const { projectId, roles } = useOutletContext<ProjectOutletContext>();
  return <MembersTab projectId={projectId} roles={roles} />;
}
