import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface EditEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEmailDialog({ open, onOpenChange }: EditEmailDialogProps) {
  const { user, updateEmail } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar el estado local con el usuario real cuando se abre el modal
  useEffect(() => {
    if (open && user) {
      setEmail(user.email || "");
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || email === user?.email) return;
    
    setIsLoading(true);
    try {
      const res = await updateEmail(email);
      if (res.success) {
        toast.success(t("editEmailDialog.toastSuccess"));
        onOpenChange(false);
      } else {
        toast.error(res.error || t("editEmailDialog.toastError"));
      }
    } catch (error) {
      toast.error(t("editEmailDialog.toastUnexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("editEmailDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("editEmailDialog.desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("editEmailDialog.labelEmail")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("editEmailDialog.placeholderEmail")}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t("editEmailDialog.cancelBtn")}
            </Button>
            <Button type="submit" disabled={isLoading || !email.trim() || email === user?.email}>
              {isLoading ? t("editEmailDialog.savingBtn") : t("editEmailDialog.saveBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
