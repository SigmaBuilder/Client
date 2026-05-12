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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Permission, Role } from '@/types/project';

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
  read: 'Ver', create: 'Crear', update: 'Editar', delete: 'Eliminar',
  invite: 'Invitar', remove: 'Eliminar miembro', manage: 'Gestionar',
};
function verbLabel(action: string) {
  const verb = action.split(':')[1] ?? action;
  return VERB_LABELS[verb] ?? verb.charAt(0).toUpperCase() + verb.slice(1);
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
      toast.error(rolesRes.error ?? 'Error cargando roles');
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
      toast.error(res.error ?? 'Error guardando permisos');
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
      toast.error('El nombre del rol es obligatorio');
      return;
    }
    setEditSaving(true);
    const res = await api.updateProjectRole<{ role: Role }>(projectId, selectedRole.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
    if (res.success && res.data) {
      setRoles(prev => prev?.map(r => r.id === selectedRole.id ? res.data!.role : r) ?? null);
      toast.success('Rol actualizado correctamente');
      setEditOpen(false);
    } else {
      toast.error(res.error ?? 'Error actualizando rol');
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
      toast.success(`Rol "${selectedRole.name}" eliminado`);
      setDeleteOpen(false);
    } else {
      toast.error(res.error ?? 'Error eliminando rol');
    }
    setDeleting(false);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('El nombre del rol es obligatorio');
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
      toast.success(`Rol "${res.data.role.name}" creado`);
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRoleOpen(false);
    } else {
      toast.error(res.error ?? 'Error creando rol');
    }
    setCreatingRole(false);
  };

  return (
    <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
      {/* Role sidebar */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Roles</p>
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
          Nuevo rol
        </Button>
      </div>

      {/* Permissions panel */}
      <div className="flex flex-col gap-4">
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
                  {selectedRole.description ?? 'Sin descripción'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={openEditDialog}>
                  <Pencil data-icon="inline-start" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 data-icon="inline-start" />
                  Eliminar
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
                          <p className="text-sm font-medium">{verbLabel(perm.action)}</p>
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
            <DialogTitle>Editar rol</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role-name">Nombre</Label>
              <Input
                id="edit-role-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                disabled={editSaving}
                placeholder="Nombre del rol"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role-desc">Descripción <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input
                id="edit-role-desc"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                disabled={editSaving}
                placeholder="Descripción del rol"
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving && <Loader2 className="size-3.5 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete role confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRole && (
                <>
                  Se eliminará el rol <strong>{selectedRole.name}</strong>.
                  Los miembros con este rol perderán sus permisos. Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-3.5 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New role dialog */}
      <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo rol</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-role-name">Nombre</Label>
              <Input
                id="new-role-name"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                disabled={creatingRole}
                placeholder="Nombre del rol"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-role-desc">Descripción <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input
                id="new-role-desc"
                value={newRoleDescription}
                onChange={e => setNewRoleDescription(e.target.value)}
                disabled={creatingRole}
                placeholder="Descripción del rol"
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleCreateRole} disabled={creatingRole}>
              {creatingRole && <Loader2 className="size-3.5 animate-spin" />}
              Crear rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
