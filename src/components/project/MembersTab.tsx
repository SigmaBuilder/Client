import { useEffect, useCallback, useState } from 'react';
import { Mail, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import api from '@/lib/api';
import type { Member, Role } from '@/types/project';
import { InviteMemberDialog } from './invite-member-dialog';
import { useTranslation } from 'react-i18next';

interface MembersTabProps {
  projectId: string;
  roles: Role[];
}

function MemberRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-8 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell />
    </TableRow>
  );
}

export function MembersTab({ projectId, roles }: MembersTabProps) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Remove confirmation dialog state
  const [removingMember, setRemovingMember] = useState<Member | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const { t } = useTranslation();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.getProjectMembers<{ members: Member[] }>(projectId);
    if (res.success && res.data) {
      setMembers(res.data.members);
    } else {
      toast.error(res.error ?? t('projectMembers.toastErrorLoad'));
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (userId: string, roleId: string) => {
    setUpdatingId(userId);
    const res = await api.updateProjectMemberRole(projectId, userId, roleId);
    if (res.success) {
      await load();
      toast.success(t('projectMembers.toastRoleSuccess'));
    } else {
      toast.error(res.error ?? t('projectMembers.toastRoleError'));
    }
    setUpdatingId(null);
  };

  const openRemoveDialog = (member: Member) => {
    setRemovingMember(member);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!removingMember) return;
    setRemoving(true);
    const res = await api.removeProjectMember(projectId, removingMember.profile.id);
    if (res.success) {
      setMembers(prev => prev?.filter(m => m.profile.id !== removingMember.profile.id) ?? null);
      toast.success(t('projectMembers.toastRemoveSuccess', { name: removingMember.profile.first_name }));
    } else {
      toast.error(res.error ?? t('projectMembers.toastRemoveError'));
    }
    setRemoving(false);
    setRemoveDialogOpen(false);
    setRemovingMember(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {loading
            ? <Skeleton className="inline-block h-4 w-24" />
            : t('projectMembers.membersCount', { count: members?.length ?? 0 })}
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Mail data-icon="inline-start" />
          {t('projectMembers.inviteBtn')}
        </Button>
      </div>

      {/* Members table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('projectMembers.colMember')}</TableHead>
              <TableHead>{t('projectMembers.colRole')}</TableHead>
              <TableHead>{t('projectMembers.colJoined')}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <MemberRowSkeleton key={i} />)
              : (members ?? []).map((member) => {
                  const fullName = `${member.profile.first_name} ${member.profile.last_name}`;
                  const initials = `${member.profile.first_name[0]}${member.profile.last_name[0]}`.toUpperCase();
                  const isUpdating = updatingId === member.profile.id;
                  return (
                    <TableRow key={member.profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isUpdating ? (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Select
                            value={member.role?.id ?? ''}
                            onValueChange={(val) => handleRoleChange(member.profile.id, val)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(r => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openRemoveDialog(member)}
                            >
                              <Trash2 />
                              {t('projectMembers.removeAction')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('projectMembers.removeDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {removingMember && (
                <span dangerouslySetInnerHTML={{ __html: t('projectMembers.removeDialogDesc', { name: `${removingMember.profile.first_name} ${removingMember.profile.last_name}` }) }} />
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>{t('projectMembers.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={removing}
            >
              {removing && <Loader2 className="size-3.5 animate-spin" />}
              {t('projectMembers.removeBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        projectId={projectId}
        roles={roles}
        onInvited={load}
      />
    </div>
  );
}
