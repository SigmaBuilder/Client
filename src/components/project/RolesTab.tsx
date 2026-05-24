import { useEffect, useCallback, useState } from 'react';
import { Plus, Pencil, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Permission, Role } from '@/types/project';
import { useTranslation } from 'react-i18next';

interface RolesTabProps {
  projectId: string;
}

/** Groups flat permission list by resource prefix (e.g. "sites:read" → "Sites"). Fully dynamic. */
function groupPermissions(permissions: Permission[]): Map<string, Permission[]> {
  const map = new Map<string, Permission[]>();
  for (const p of permissions) {
    const key = p.action.split(':')[0] ?? 'other';
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(p);
  }
  return map;
}

const VERB_LABELS: Record<string, string> = {
  read: 'projectRoles.verbRead', create: 'projectRoles.verbCreate', update: 'projectRoles.verbUpdate', delete: 'projectRoles.verbDelete',
  invite: 'projectRoles.verbInvite', remove: 'projectRoles.verbRemove', manage: 'projectRoles.verbManage',
};
function verbLabel(action: string, t: any) {
  const verb = action.split(':')[1] ?? action;
  return VERB_LABELS[verb] ? t(VERB_LABELS[verb]) : verb.charAt(0).toUpperCase() + verb.slice(1);
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
    </div>
  );
}

function PermissionsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-20 w-full" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
    </div>
  );
}

export function RolesTab({ projectId }: RolesTabProps) {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[] | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  // Edit role dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete role dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New role dialog
  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [creatingRole, setCreatingRole] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [rolesRes, permsRes] = await Promise.all([
      api.getProjectRoles<{ roles: Role[] }>(projectId),
      api.getProjectAllPermissions<{ permissions: Permission[] }>(projectId),
    ]);
    if (rolesRes.success && rolesRes.data) {
      setRoles(rolesRes.data.roles);
      setSelectedRoleId(prev => prev ?? rolesRes.data!.roles[0]?.id ?? null);
    } else {
      toast.error(rolesRes.error ?? t('projectRoles.toastErrorLoad'));
    }
    if (permsRes.success && permsRes.data) {
      setAllPermissions(permsRes.data.permissions);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const selectedRole = roles?.find(r => r.id === selectedRoleId) ?? null;
  const grouped = allPermissions ? groupPermissions(allPermissions) : new Map<string, Permission[]>();

  const hasPermission = (permId: string) =>
    (selectedRole?.permissions ?? []).some(p => p.id === permId);

  const handleToggle = async (permId: string, checked: boolean) => {
    if (!selectedRole) return;
    const currentIds = (selectedRole.permissions ?? []).map(p => p.id);
    const newIds = checked ? [...currentIds, permId] : currentIds.filter(id => id !== permId);
    setSaving(true);
    const res = await api.setRolePermissions<{ role: Role }>(projectId, selectedRole.id, newIds);
    if (res.success && res.data) {
      setRoles(prev => prev?.map(r => r.id === selectedRole.id ? res.data!.role : r) ?? null);
    } else {
      toast.error(res.error ?? t('projectRoles.toastErrorPerms'));
    }
    setSaving(false);
  };

  // Open edit dialog with current role data
  const openEditDialog = () => {
    if (!selectedRole) return;
    setEditName(selectedRole.name);
    setEditDescription(selectedRole.description ?? '');
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedRole || !editName.trim()) {
      toast.error(t('projectRoles.toastNameRequired'));
      return;
    }
    setEditSaving(true);
    const res = await api.updateProjectRole<{ role: Role }>(projectId, selectedRole.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
    if (res.success && res.data) {
      setRoles(prev => prev?.map(r => r.id === selectedRole.id ? res.data!.role : r) ?? null);
      toast.success(t('projectRoles.toastUpdateSuccess'));
      setEditOpen(false);
    } else {
      toast.error(res.error ?? t('projectRoles.toastUpdateError'));
    }
    setEditSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    setDeleting(true);
    const res = await api.deleteProjectRole(projectId, selectedRole.id);
    if (res.success) {
      const remaining = (roles ?? []).filter(r => r.id !== selectedRole.id);
      setRoles(remaining);
      setSelectedRoleId(remaining[0]?.id ?? null);
      toast.success(t('projectRoles.toastDeleteSuccess', { name: selectedRole.name }));
      setDeleteOpen(false);
    } else {
      toast.error(res.error ?? t('projectRoles.toastDeleteError'));
    }
    setDeleting(false);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error(t('projectRoles.toastNameRequired'));
      return;
    }
    setCreatingRole(true);
    const res = await api.createProjectRole<{ role: Role }>(projectId, {
      name: newRoleName.trim(),
      description: newRoleDescription.trim() || undefined,
    });
    if (res.success && res.data) {
      setRoles(prev => [...(prev ?? []), res.data!.role]);
      setSelectedRoleId(res.data.role.id);
      toast.success(t('projectRoles.toastCreateSuccess', { name: res.data.role.name }));
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRoleOpen(false);
    } else {
      toast.error(res.error ?? t('projectRoles.toastCreateError'));
    }
    setCreatingRole(false);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-[200px_1fr] gap-6 items-start w-full">
      {/* Mobile selector */}
      <div className="md:hidden flex items-center gap-2 w-full mb-2">
        <div className="flex-1">
          <Select value={selectedRoleId ?? ''} onValueChange={setSelectedRoleId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('projectRoles.rolesLabel')} />
            </SelectTrigger>
            <SelectContent>
              {(roles ?? []).map(role => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <span>{role.name}</span>
                    {role.super && <Badge variant="secondary" className="ml-1 py-0 px-1 text-[10px]">super</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-dashed"
          onClick={() => setNewRoleOpen(true)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Role sidebar */}
      <div className="hidden md:flex md:flex-col gap-1 w-full">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-1">{t('projectRoles.rolesLabel')}</p>
        {loading ? <SidebarSkeleton /> : (roles ?? []).map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRoleId(role.id)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2',
              selectedRoleId === role.id
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <span className="truncate">{role.name}</span>
            {role.super && <Badge variant="secondary">super</Badge>}
          </button>
        ))}
        <Separator className="my-2" />
        <Button
          variant="outline"
          size="sm"
          className="border-dashed"
          onClick={() => setNewRoleOpen(true)}
        >
          <Plus data-icon="inline-start" />
          {t('projectRoles.newRoleBtn')}
        </Button>
      </div>

      {/* Permissions panel */}
      <div className="flex flex-col gap-4 w-full">
        {loading ? <PermissionsSkeleton /> : selectedRole && (
          <>
            {/* Role header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedRole.name}
                  {selectedRole.super && <Badge variant="secondary">Super</Badge>}
                  {saving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                </CardTitle>
                <CardDescription>
                  {selectedRole.description ?? t('projectRoles.noDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={openEditDialog}>
                  <Pencil data-icon="inline-start" />
                  {t('projectRoles.editBtn')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 data-icon="inline-start" />
                  {t('projectRoles.deleteBtn')}
                </Button>
              </CardContent>
            </Card>

            {/* Permission groups */}
            {Array.from(grouped.entries()).map(([resource, perms]) => (
              <Card key={resource}>
                <CardHeader>
                  <CardTitle>{resource}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-0">
                  {perms.map((perm, i) => (
                    <div key={perm.id}>
                      {i > 0 && <Separator className="my-3" />}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{verbLabel(perm.action, t)}</p>
                          <p className="text-xs text-muted-foreground font-mono">{perm.action}</p>
                        </div>
                        <Switch
                          checked={hasPermission(perm.id)}
                          disabled={saving}
                          onCheckedChange={(checked) => handleToggle(perm.id, checked)}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Edit role dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('projectRoles.editRoleTitle')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role-name">{t('projectRoles.nameLabel')}</Label>
              <Input
                id="edit-role-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                disabled={editSaving}
                placeholder={t('projectRoles.namePlaceholder')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role-desc">{t('projectRoles.descLabel')} <span className="text-muted-foreground font-normal">{t('projectRoles.optional')}</span></Label>
              <Input
                id="edit-role-desc"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                disabled={editSaving}
                placeholder={t('projectRoles.descPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving && <Loader2 className="size-3.5 animate-spin" />}
              {t('projectRoles.saveChangesBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete role confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('projectRoles.deleteDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRole && (
                <span dangerouslySetInnerHTML={{ __html: t('projectRoles.deleteDialogDesc', { name: selectedRole.name }) }} />
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('projectRoles.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-3.5 animate-spin" />}
              {t('projectRoles.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New role dialog */}
      <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('projectRoles.createRoleTitle')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-role-name">{t('projectRoles.nameLabel')}</Label>
              <Input
                id="new-role-name"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                disabled={creatingRole}
                placeholder={t('projectRoles.namePlaceholder')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-role-desc">{t('projectRoles.descLabel')} <span className="text-muted-foreground font-normal">{t('projectRoles.optional')}</span></Label>
              <Input
                id="new-role-desc"
                value={newRoleDescription}
                onChange={e => setNewRoleDescription(e.target.value)}
                disabled={creatingRole}
                placeholder={t('projectRoles.descPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleCreateRole} disabled={creatingRole}>
              {creatingRole && <Loader2 className="size-3.5 animate-spin" />}
              {t('projectRoles.createRoleBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
