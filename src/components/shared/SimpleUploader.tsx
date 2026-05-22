import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface SimpleUploaderProps {
  onUploadSuccess: (url: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  projectId: string; // Needed for the backend
  folderId?: string; // Optional folder
  className?: string;
}

export function SimpleUploader({ 
  onUploadSuccess, 
  accept = { 'image/*': [] }, 
  maxSize = 5242880, // 5MB default
  projectId,
  folderId,
  className
}: SimpleUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    
    // In a real app this should be abstracted into an api service function
    const uploadPromise = new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folderId', folderId);

        const response = await api.uploadMediaAsset<any>(projectId, formData);

        if (!response.success) throw new Error(response.error || 'Failed to upload');
        const data = response.data;
        
        onUploadSuccess(data.file_url);
        resolve(data);
      } catch (err) {
        reject(err);
      } finally {
        setIsUploading(false);
      }
    });

    toast.promise(uploadPromise, {
      loading: 'Subiendo archivo...',
      success: 'Archivo subido correctamente',
      error: 'Error al subir el archivo',
    });
  }, [projectId, folderId, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:bg-muted/50",
        isDragReject && "border-destructive bg-destructive/10",
        isUploading && "pointer-events-none opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : (
        <UploadCloud className={cn("h-8 w-8 mb-2", isDragActive ? "text-primary" : "text-muted-foreground")} />
      )}
      <div className="text-sm font-medium text-center">
        {isUploading ? (
          <p>Subiendo...</p>
        ) : isDragActive ? (
          <p>Suelta el archivo aquí</p>
        ) : (
          <p>Arrastra un archivo o haz clic</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        PNG, JPG o SVG (Max 5MB)
      </p>
    </div>
  );
}
