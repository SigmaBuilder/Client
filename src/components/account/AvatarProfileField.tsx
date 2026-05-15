import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import ImageUploadDropzone from "@/components/upload/ImageUploadDropzone";

export default function AvatarProfileField() {
  const { user, updateCurrentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase()
    : "??";

  const handleFileSelect = (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const uploadPromise = api.uploadAvatar<any>(formData).then((res) => {
      if (!res.success) throw new Error(res.error || 'Error al subir la imagen');
      if (res.data?.user) {
        updateCurrentUser(res.data.user);
      }
    }).finally(() => {
      setIsUploading(false);
    });

    toast.promise(uploadPromise, {
      loading: 'Subiendo avatar...',
      success: 'Foto de perfil actualizada correctamente',
      error: 'No se pudo subir la foto de perfil. Usa JPG, PNG o WebP de hasta 2 MB.',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 items-center group">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Foto de perfil</p>
        <p className="text-xs text-muted-foreground">Recomendado 256x256px</p>
      </div>

      <div className="sm:col-span-2">
        <ImageUploadDropzone
          value={user?.avatar_url}
          fallback={initials}
          label="Foto de perfil"
          description="Arrastra una imagen o selecciona JPG, PNG o WebP de hasta 2 MB"
          loading={isUploading}
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
}
