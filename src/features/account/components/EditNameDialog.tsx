import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditNameDialog({ open, onOpenChange }: EditNameDialogProps) {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar el estado local con el usuario real cuando se abre el modal
  useEffect(() => {
    if (open && user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await updateProfile({ first_name: firstName, last_name: lastName });
      if (res.success) {
        toast.success(t("editNameDialog.toastSuccess"));
        onOpenChange(false);
      } else {
        toast.error(res.error || t("editNameDialog.toastError"));
      }
    } catch (error) {
      toast.error(t("editNameDialog.toastUnexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("editNameDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("editNameDialog.desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">{t("editNameDialog.labelFirstName")}</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("editNameDialog.placeholderFirstName")}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">{t("editNameDialog.labelLastName")}</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("editNameDialog.placeholderLastName")}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t("editNameDialog.cancelBtn")}
            </Button>
            <Button type="submit" disabled={isLoading || !firstName.trim() || !lastName.trim()}>
              {isLoading ? t("editNameDialog.savingBtn") : t("editNameDialog.saveBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
