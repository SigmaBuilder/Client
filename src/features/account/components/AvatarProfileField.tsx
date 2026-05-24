import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import ImageUploadDropzone from "@/components/upload/ImageUploadDropzone";
import { useTranslation } from "react-i18next";

export default function AvatarProfileField() {
  const { user, updateCurrentUser } = useAuth();
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);

  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase()
    : "??";

  const handleFileSelect = (file: File) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const uploadPromise = api.uploadAvatar<any>(formData).then((res) => {
      if (!res.success) throw new Error(res.error || t("avatarProfileField.toastError"));
      if (res.data?.user) {
        updateCurrentUser(res.data.user);
      }
    }).finally(() => {
      setIsUploading(false);
    });

    toast.promise(uploadPromise, {
      loading: t("avatarProfileField.toastLoading"),
      success: t("avatarProfileField.toastSuccess"),
      error: t("avatarProfileField.toastFail"),
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 items-center group">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{t("avatarProfileField.label")}</p>
        <p className="text-xs text-muted-foreground">{t("avatarProfileField.recommended")}</p>
      </div>

      <div className="sm:col-span-2">
        <ImageUploadDropzone
          value={user?.avatar_url}
          fallback={initials}
          label={t("avatarProfileField.label")}
          description={t("avatarProfileField.dropzoneDesc")}
          loading={isUploading}
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
}
