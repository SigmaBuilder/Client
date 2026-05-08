import { ModeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardIndex() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <ModeToggle />
      <Button onClick={() => toast("Hello from Dashboard!")}>
        Mostrar Toast
      </Button>
    </div>
  );
}
