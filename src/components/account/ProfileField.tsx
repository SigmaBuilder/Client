import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileFieldProps {
  label: string;
  value: string;
  type?: "text" | "password";
  onEdit?: () => void;
}

export default function ProfileField({ label, value, type = "text", onEdit }: ProfileFieldProps) {
  const { t } = useTranslation();
  const displayValue = type === "password" ? "••••••••" : value;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 items-center group">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      
      <div className="flex items-center justify-between sm:col-span-2">
        <p className="text-base font-medium truncate pr-4">{displayValue}</p>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onEdit} 
          aria-label={t("profileField.editAria", { label })}
          className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shrink-0"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
