import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ProfileField from "@/features/account/components/ProfileField";
import AvatarProfileField from "@/features/account/components/AvatarProfileField";
import EditNameDialog from "@/features/account/components/EditNameDialog";
import EditEmailDialog from "@/features/account/components/EditEmailDialog";
import EditPasswordDialog from "@/features/account/components/EditPasswordDialog";
import { useTranslation } from "react-i18next";

export default function ProfileSection() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
          <CardTitle className="text-xl">{t("profileSection.title")}</CardTitle>
          <CardDescription>
            {t("profileSection.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <AvatarProfileField />
            <Separator />
            <ProfileField 
              label={t("profileSection.nameLabel")} 
              value={user ? `${user.first_name} ${user.last_name}` : ""} 
              onEdit={() => handleEdit("nombre")}
            />
            <Separator />
            <ProfileField 
              label={t("profileSection.emailLabel")} 
              value={user?.email || ""} 
              onEdit={() => handleEdit("email")}
            />
            <Separator />
            <ProfileField 
              label={t("profileSection.passwordLabel")} 
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
