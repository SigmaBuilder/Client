import { useRef, useState, useCallback, useMemo, type DragEvent } from "react";
import { useWorkspace } from "../../hooks/use-workspace";
import { MediaLibraryView, type MediaLibraryPathItem } from "../../components/shared/MediaLibrary/MediaLibraryView";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { Plus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useSetSitePageHeader } from "../../components/site/SitePageHeader";

export default function SiteMediaPage() {
  const { currentSite, currentProject, isLoading, error } = useWorkspace();
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [search, setSearch] = useState("");
  const [mediaPath, setMediaPath] = useState<MediaLibraryPathItem[]>([]);
  const [dragOverBreadcrumbId, setDragOverBreadcrumbId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigatePathRef = useRef<((index: number) => void) | null>(null);
  const currentFolderId = mediaPath.length > 0 ? mediaPath[mediaPath.length - 1].id : null;

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentProject) return;
    try {
      const res = await api.createMediaFolder(currentProject.id, newFolderName.trim(), currentFolderId);
      if (!res.success) throw new Error(res.error || "Failed to create folder");
      toast.success("Carpeta creada");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      setRefreshKey((key) => key + 1);
    } catch {
      toast.error("Error al crear carpeta");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentProject) return;

    const formData = new FormData();
    formData.append("file", files[0]);
    if (currentFolderId) formData.append("folderId", currentFolderId);

    toast.promise(
      api.uploadMediaAsset(currentProject.id, formData).then((res) => {
        if (!res.success) throw new Error(res.error || "Failed to upload");
        setRefreshKey((key) => key + 1);
      }),
      {
        loading: "Subiendo archivo...",
        success: "Archivo subido",
        error: "Error al subir",
      }
    );

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMediaPathChange = useCallback((
    nextPath: MediaLibraryPathItem[],
    navigateToPathIndex: (index: number) => void,
  ) => {
    navigatePathRef.current = navigateToPathIndex;
    setMediaPath((currentPath) => {
      const currentKey = currentPath.map((item) => item.id ?? "root").join("/");
      const nextKey = nextPath.map((item) => item.id ?? "root").join("/");
      return currentKey === nextKey ? currentPath : nextPath;
    });
  }, []);

  const handleDropOnBreadcrumb = useCallback(async (
    event: DragEvent,
    targetFolderId: string | null,
  ) => {
    event.preventDefault();
    const dataString = event.dataTransfer.getData("application/json");
    setDragOverBreadcrumbId(null);
    if (!dataString || !currentProject) return;

    try {
      const data = JSON.parse(dataString);
      if (data.type !== "asset") return;

      const res = await api.moveMediaAsset(currentProject.id, data.id, targetFolderId);
      if (!res.success) throw new Error(res.error || "Failed to move asset");
      toast.success("Archivo movido");
      setRefreshKey((key) => key + 1);
    } catch {
      toast.error("Error al mover elemento");
    }
  }, [currentProject]);

  const headerState = useMemo(() => ({
    breadcrumbs: (mediaPath.length > 0 ? mediaPath : [{ id: null, name: "Proyecto" }]).map((item, index) => ({
      label: item.name,
      onClick: () => navigatePathRef.current?.(index),
      onDragOver: (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverBreadcrumbId(item.id ?? "root");
      },
      onDragLeave: () => setDragOverBreadcrumbId(null),
      onDrop: (event: React.DragEvent) => handleDropOnBreadcrumb(event, item.id),
      isDropTarget: dragOverBreadcrumbId === (item.id ?? "root"),
    })),
    search: {
      value: search,
      onChange: setSearch,
      placeholder: "Buscar archivos...",
    },
    actions: (
      <>
        <Button variant="outline" size="sm" onClick={() => setIsCreateFolderOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Carpeta
        </Button>
        <Button size="sm" onClick={handleUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Subir
        </Button>
      </>
    ),
  }), [dragOverBreadcrumbId, handleDropOnBreadcrumb, handleUploadClick, mediaPath, search]);

  useSetSitePageHeader(headerState);


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !currentSite || !currentProject) {
    return <div className="p-8 text-red-500">{error || "Sitio no encontrado."}</div>;
  }

  return (
    <>
      <MediaLibraryView
        projectId={currentProject.id}
        siteId={currentSite.id}
        searchQuery={search}
        hideHeader
        refreshKey={refreshKey}
        onPathChange={handleMediaPathChange}
      />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva carpeta</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Nombre de la carpeta</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ej. Imágenes de producto"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Crear carpeta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
