import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MediaLibraryView, MediaAsset } from './MediaLibraryView';

interface MediaLibraryManagerProps {
  projectId: string;
  siteId?: string;
  onSelect?: (asset: MediaAsset) => void;
  trigger?: React.ReactNode;
}

export function MediaLibraryManager({ projectId, siteId, onSelect, trigger }: MediaLibraryManagerProps) {
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
        {trigger || <Button variant="outline">Abrir Media Library</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Librería de Medios</DialogTitle>
        </DialogHeader>
        {isOpen && (
          <MediaLibraryView 
            projectId={projectId} 
            siteId={siteId} 
            onSelect={handleSelect} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
