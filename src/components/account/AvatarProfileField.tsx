import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AvatarProfileField() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase()
    : "??";

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Archivo seleccionado para foto de perfil:", file.name);
      // TODO: Lógica de subida al servidor en la próxima fase
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 items-center group">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Foto de perfil</p>
        <p className="text-xs text-muted-foreground">Recomendado 256x256px</p>
      </div>

      <div className="flex items-center justify-between sm:col-span-2">
        <Avatar className="h-16 w-16 border shadow-sm">
          {user?.avatar_url && (
            <AvatarImage src={user.avatar_url} alt={user.first_name} />
          )}
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEditClick} 
          className="shrink-0"
        >
          <Camera className="h-4 w-4 mr-2" />
          Cambiar
        </Button>
      </div>
      
      {/* Input oculto para subir archivos */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />
    </div>
  );
}
