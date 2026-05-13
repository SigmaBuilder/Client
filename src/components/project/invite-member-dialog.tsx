import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import type { Role } from '@/types/project';

interface InviteMemberDialogProps {
  projectId: string;
  roles: Role[];
  onInvited?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ projectId, roles, onInvited, open, onOpenChange }: InviteMemberDialogProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteRoleId) {
      toast.error('Completa todos los campos');
      return;
    }
    setInviting(true);
    
    try {
      const res = await api.inviteProjectMember(projectId, inviteEmail.trim(), inviteRoleId);
      if (res.success) {
        toast.success(`Invitación enviada a ${inviteEmail}`);
        setInviteEmail('');
        setInviteRoleId('');
        onOpenChange(false);
        if (onInvited) onInvited();
      } else {
        toast.error(res.error ?? 'Error enviando invitación');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar con el servidor.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar miembro</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">Correo electrónico</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              disabled={inviting}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role">Rol</Label>
            <Select value={inviteRoleId} onValueChange={setInviteRoleId} disabled={inviting}>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Seleccionar rol…" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleInvite} disabled={inviting}>
            {inviting && <Loader2 className="size-3.5 animate-spin" />}
            Enviar invitación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
