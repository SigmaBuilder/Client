import { useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function NavigationBlocker({ shouldBlock }: { shouldBlock: boolean }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock && currentLocation.pathname !== nextLocation.pathname
  );

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [blocker.state]);

  const onContinue = () => {
    setIsOpen(false);
    blocker.proceed?.();
  };

  const onCancel = () => {
    setIsOpen(false);
    blocker.reset?.();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) onCancel();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
          <AlertDialogDescription>
            Tienes cambios sin guardar en la página actual. Si continúas, perderás todo tu progreso.
            ¿Estás seguro de que deseas salir?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Permanecer</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Salir sin guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
