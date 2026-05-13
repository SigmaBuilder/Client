import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface EditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditNameDialog({ open, onOpenChange }: EditNameDialogProps) {
  const { user, updateProfile } = useAuth();
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
        toast.success("Perfil actualizado correctamente");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al actualizar el perfil");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Actualizar nombre</DialogTitle>
            <DialogDescription>
              Introduce tu nombre y apellidos. Esto es lo que verán otros miembros de tu equipo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Jane"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Doe"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !firstName.trim() || !lastName.trim()}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
