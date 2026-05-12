import { useOutletContext } from 'react-router-dom';
import { MembersTab } from '@/components/project/MembersTab';
import type { ProjectOutletContext } from '@/layouts/ProjectLayout';

export default function ProjectMembersPage() {
  const { projectId, roles } = useOutletContext<ProjectOutletContext>();
  return <MembersTab projectId={projectId} roles={roles} />;
}
