import ProfileSection from "@/components/account/ProfileSection";
import LinkedAccounts from "@/components/account/LinkedAccounts";
import ConnectedDevices from "@/components/account/ConnectedDevices";

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mi Cuenta</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu perfil y preferencias.
        </p>
      </div>

      <div className="grid gap-8">
        <ProfileSection />
        <LinkedAccounts />
        <ConnectedDevices />
      </div>
    </div>
  );
}
