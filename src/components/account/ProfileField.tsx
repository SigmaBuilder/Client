import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ProfileFieldProps {
  label: string;
  value: string;
  type?: "text" | "password";
  onEdit?: () => void;
}

export default function ProfileField({ label, value, type = "text", onEdit }: ProfileFieldProps) {

  const displayValue = type === "password" ? "••••••••" : value;

  return (
    <div className="flex items-center justify-between py-4 group">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none text-muted-foreground">{label}</p>
        <p className="text-base font-medium">{displayValue}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onEdit} 
        aria-label={`Editar ${label}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
      >
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
