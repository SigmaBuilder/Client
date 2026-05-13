import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProfileField from "./ProfileField";

export default function ProfileSection() {
  const { user } = useAuth();

  const handleEdit = (field: string) => {
    alert(`Lógica de edición para ${field} próximamente`);
  };

  return (
    <Card className="max-w-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Información Personal</CardTitle>
        <CardDescription>
          Administra tus datos personales y credenciales de acceso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
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
  );
}
