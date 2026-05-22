import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaLibraryView, MediaAsset } from "./MediaLibraryView";
import { useTranslation } from "react-i18next";

interface MediaLibraryManagerProps {
  projectId: string;
  siteId?: string;
  onSelect?: (asset: MediaAsset) => void;
  trigger?: React.ReactNode;
}

export function MediaLibraryManager({
  projectId,
  siteId,
  onSelect,
  trigger,
}: MediaLibraryManagerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (asset: MediaAsset) => {
    if (onSelect) {
      onSelect(asset);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">{t("mediaLibrary.managerOpenBtn")}</Button>}
      </DialogTrigger>
      <DialogContent className="w-[95vw]! max-w-6xl! h-[85vh] flex flex-col p-0 overflow-hidden gap-0 bg-background border-border shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b bg-muted/40">
          <DialogTitle className="text-xl font-semibold">
            {t("mediaLibrary.managerTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 relative">
          {isOpen && (
            <MediaLibraryView
              projectId={projectId}
              siteId={siteId}
              onSelect={handleSelect}
              className="h-full border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
