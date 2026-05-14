import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWorkspace } from "../../hooks/use-workspace";
import { MediaLibraryView } from "../../components/shared/MediaLibrary/MediaLibraryView";
import { Skeleton } from "../../components/ui/skeleton";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function SiteMediaPage() {
  const { slug } = useParams<{ slug: string }>();
  const { currentSite, currentProject, isLoading, fetchSiteBySlug, error } =
    useWorkspace();

  useEffect(() => {
    if (slug) {
      fetchSiteBySlug(slug);
    }
  }, [slug, fetchSiteBySlug]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!currentSite && !isLoading) {
    return <div className="p-8">Sitio no encontrado.</div>;
  }

  if (currentSite && currentProject) {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-theme(spacing.16))] p-8 pt-6">
        <div className="flex items-center justify-between space-y-2 mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ImageIcon className="h-8 w-8 text-primary" />
              Librería de Medios
            </h2>
            <p className="text-muted-foreground">
              Gestiona los archivos de {currentSite.name || currentSite.slug}
            </p>
          </div>
        </div>

        {/* Renderizamos el componente View en modo pantalla completa y le pasamos tanto el project como el site para que enrute automáticamente la carpeta raíz */}
        <div className="flex-1 min-h-0 bg-card rounded-xl border shadow-sm p-4">
          <MediaLibraryView
            projectId={currentProject.id}
            siteId={currentSite.id}
            onSelect={(asset) => {
              navigator.clipboard.writeText(asset.file_url);
              toast.success("URL copiada al portapapeles");
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}
