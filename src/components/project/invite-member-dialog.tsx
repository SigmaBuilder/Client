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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteRoleId) {
      toast.error(t('inviteDialog.toastFillFields'));
      return;
    }
    setInviting(true);
    
    try {
      const res = await api.inviteProjectMember(projectId, inviteEmail.trim(), inviteRoleId);
      if (res.success) {
        toast.success(t('inviteDialog.toastSuccess', { email: inviteEmail }));
        setInviteEmail('');
        setInviteRoleId('');
        onOpenChange(false);
        if (onInvited) onInvited();
      } else {
        toast.error(res.error ?? t('inviteDialog.toastError'));
      }
    } catch (err: any) {
      toast.error(err.message || t('inviteDialog.toastErrorConnect'));
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inviteDialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">{t('inviteDialog.emailLabel')}</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder={t('inviteDialog.emailPlaceholder')}
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              disabled={inviting}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role">{t('inviteDialog.roleLabel')}</Label>
            <Select value={inviteRoleId} onValueChange={setInviteRoleId} disabled={inviting}>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder={t('inviteDialog.rolePlaceholder')} />
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
            {t('inviteDialog.sendBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
