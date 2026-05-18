import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft, ImagePlus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaLibraryView } from "@/components/shared/MediaLibrary/MediaLibraryView";

export default function PortfolioItemForm() {
  const { currentSite, currentProject } = useWorkspace();
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEditing = !!itemId;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    live_url: "",
    repository_url: "",
    sort_order: 0,
  });

  const itemsPath = `/dashboard/site/${currentSite?.slug}/portfolio/items`;

  useEffect(() => {
    if (isEditing && currentSite?.id && itemId) {
      const fetchItem = async () => {
        try {
          const res = await api.getPortfolioItem<{ portfolioItem: any }>(
            currentSite.id,
            itemId,
          );
          if (res.success && res.data) {
            const item = res.data.portfolioItem;
            setFormData({
              title: item.title || "",
              description: item.description || "",
              image_url: item.image_url || "",
              live_url: item.live_url || "",
              repository_url: item.repository_url || "",
              sort_order: item.sort_order || 0,
            });
          } else {
            toast.error("Error al cargar el proyecto");
            navigate(itemsPath);
          }
        } catch {
          toast.error("Error de conexión");
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [currentSite?.id, itemId, isEditing, navigate, itemsPath]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "sort_order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleMediaSelect = useCallback((asset: { file_url: string }) => {
    setFormData((prev) => ({ ...prev, image_url: asset.file_url }));
    setIsMediaOpen(false);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProject) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    toast.promise(
      api
        .uploadMediaAsset<any>(currentProject.id, formDataUpload)
        .then((res) => {
          if (!res.success) throw new Error(res.error || "Error al subir");
          if (res.data?.asset?.file_url) {
            setFormData((prev) => ({
              ...prev,
              image_url: res.data.asset.file_url,
            }));
          }
        }),
      {
        loading: "Subiendo imagen...",
        success: "Imagen subida",
        error: "Error al subir la imagen",
      },
    );

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!currentSite?.id) return;
    if (!formData.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
        live_url: formData.live_url || undefined,
        repository_url: formData.repository_url || undefined,
        sort_order: formData.sort_order,
      };

      let res;
      if (isEditing && itemId) {
        res = await api.updatePortfolioItem(currentSite.id, itemId, payload);
      } else {
        res = await api.createPortfolioItem(currentSite.id, payload);
      }

      if (res.success) {
        toast.success(isEditing ? "Proyecto actualizado" : "Proyecto creado");
        navigate(itemsPath);
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const headerState = useMemo(
    () => ({
      breadcrumbs: [
        { label: "Portfolio" },
        { label: "Proyectos", onClick: () => navigate(itemsPath) },
        { label: isEditing ? "Editar Proyecto" : "Nuevo Proyecto" },
      ],
      actions: (
        <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      ),
    }),
    [isEditing, navigate, handleSave, isSaving, isLoading, itemsPath],
  );

  useSetSitePageHeader(headerState);

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-2xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(itemsPath)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-xl font-semibold tracking-tight">
            {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
          </h2>
        </div>

        <div className="space-y-6 bg-card border rounded-md p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del proyecto</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej. Mi App Web"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-30 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe brevemente tu proyecto..."
            />
          </div>

          <div className="space-y-2">
            <Label>Imagen del proyecto</Label>
            {formData.image_url ? (
              <div className="relative rounded-md border overflow-hidden group">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMediaOpen(true)}
                  >
                    Cambiar
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, image_url: "" }))
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setIsMediaOpen(true)}
                  className="flex flex-col items-center justify-center h-32 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50 transition-colors gap-2 text-muted-foreground"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Seleccionar de la librería</span>
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Input
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="O pega una URL directa..."
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live_url">URL de demo</Label>
            <Input
              id="live_url"
              name="live_url"
              value={formData.live_url}
              onChange={handleChange}
              placeholder="https://mi-proyecto.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository_url">URL del repositorio</Label>
            <Input
              id="repository_url"
              name="repository_url"
              value={formData.repository_url}
              onChange={handleChange}
              placeholder="https://github.com/user/repo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Orden de aparición</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <Dialog open={isMediaOpen} onOpenChange={setIsMediaOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Seleccionar imagen</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {currentProject && currentSite && (
              <MediaLibraryView
                projectId={currentProject.id}
                siteId={currentSite.id}
                hideHeader
                onSelect={handleMediaSelect}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
