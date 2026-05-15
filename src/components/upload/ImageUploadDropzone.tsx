import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageUploadDropzoneProps = {
  value?: string | null;
  fallback: string;
  label?: string;
  description?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  loading?: boolean;
  onFileSelect: (file: File) => void;
  className?: string;
};

const DEFAULT_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export default function ImageUploadDropzone({
  value,
  fallback,
  label = "Cambiar imagen",
  description = "Arrastra una imagen aquí o haz clic para seleccionarla",
  accept = DEFAULT_ACCEPT,
  maxSize = 2 * 1024 * 1024,
  disabled = false,
  loading = false,
  onFileSelect,
  className,
}: ImageUploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [file] = acceptedFiles;
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    maxSize,
    multiple: false,
    disabled: disabled || loading,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col gap-3 rounded-lg border border-dashed bg-background p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
        isDragActive && "border-primary bg-primary/5",
        (disabled || loading) && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <input {...getInputProps()} />

      <div className="flex items-center gap-3">
        <Avatar className="size-16 border shadow-sm">
          {value && <AvatarImage src={value} alt={label} />}
          <AvatarFallback className="bg-primary/10 text-lg text-primary">
            {fallback}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ImagePlus className="size-4 text-muted-foreground" aria-hidden="true" />
            {isDragActive ? "Suelta la imagen" : label}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || loading}
        className="shrink-0"
      >
        {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Camera data-icon="inline-start" />}
        Cambiar
      </Button>
    </div>
  );
}
