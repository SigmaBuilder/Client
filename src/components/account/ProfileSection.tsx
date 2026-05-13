import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProfileField from "./ProfileField";
import AvatarProfileField from "./AvatarProfileField";
import EditNameDialog from "./EditNameDialog";
import EditEmailDialog from "./EditEmailDialog";
import EditPasswordDialog from "./EditPasswordDialog";

export default function ProfileSection() {
  const { user } = useAuth();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleEdit = (field: string) => {
    switch (field) {
      case "nombre":
        setIsNameModalOpen(true);
        break;
      case "email":
        setIsEmailModalOpen(true);
        break;
      case "password":
        setIsPasswordModalOpen(true);
        break;
    }
  };

  return (
    <>
      <Card className="w-full border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Información Personal</CardTitle>
          <CardDescription>
            Administra tus datos personales y credenciales de acceso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <AvatarProfileField />
            <Separator />
            <ProfileField 
              label="Nombre completo" 
              value={user ? `${user.first_name} ${user.last_name}` : ""} 
              onEdit={() => handleEdit("nombre")}
            />
            <Separator />
            <ProfileField 
              label="Correo electrónico" 
              value={user?.email || ""} 
              onEdit={() => handleEdit("email")}
            />
            <Separator />
            <ProfileField 
              label="Contraseña" 
              value="dummy" 
              type="password"
              onEdit={() => handleEdit("password")}
            />
          </div>
        </CardContent>
      </Card>

      <EditNameDialog 
        open={isNameModalOpen} 
        onOpenChange={setIsNameModalOpen} 
      />
      <EditEmailDialog 
        open={isEmailModalOpen} 
        onOpenChange={setIsEmailModalOpen} 
      />
      <EditPasswordDialog 
        open={isPasswordModalOpen} 
        onOpenChange={setIsPasswordModalOpen} 
      />
    </>
  );
}
