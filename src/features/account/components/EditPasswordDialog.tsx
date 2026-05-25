import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPasswordDialog({ open, onOpenChange }: EditPasswordDialogProps) {
  const { updatePassword } = useAuth();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Limpiar los campos cada vez que se abre el modal por seguridad
  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) return;
    
    if (newPassword.length < 8) {
      toast.error(t("editPasswordDialog.toastShort"));
      return;
    }

    setIsLoading(true);
    try {
      const res = await updatePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success(t("editPasswordDialog.toastSuccess"));
        onOpenChange(false);
      } else {
        toast.error(res.error || t("editPasswordDialog.toastError"));
      }
    } catch (error) {
      toast.error(t("editPasswordDialog.toastUnexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("editPasswordDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("editPasswordDialog.desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">{t("editPasswordDialog.labelCurrent")}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">{t("editPasswordDialog.labelNew")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t("editPasswordDialog.cancelBtn")}
            </Button>
            <Button type="submit" disabled={isLoading || !currentPassword.trim() || !newPassword.trim()}>
              {isLoading ? t("editPasswordDialog.savingBtn") : t("editPasswordDialog.saveBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
