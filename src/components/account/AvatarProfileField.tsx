import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AvatarProfileField() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase()
    : "??";

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const uploadPromise = api.uploadAvatar<any>(formData).then((res) => {
      if (!res.success) throw new Error(res.error || 'Error al subir la imagen');
      if (res.data?.user) {
         updateProfile({ avatar_url: res.data.user.avatar_url });
      }
    }).finally(() => {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });

    toast.promise(uploadPromise, {
      loading: 'Subiendo avatar...',
      success: 'Foto de perfil actualizada correctamente',
      error: 'No se pudo subir la foto de perfil',
    });
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
          disabled={isUploading}
          className="shrink-0"
        >
          {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
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
