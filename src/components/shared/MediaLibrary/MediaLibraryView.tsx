import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Folder,
  File as FileIcon,
  ArrowLeft,
  Download,
  Trash2,
  X,
  Copy,
  Upload,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

export interface MediaAsset {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
}

export type MediaLibraryPathItem = { id: string | null; name: string };

export interface MediaLibraryViewProps {
  projectId: string;
  siteId?: string;
  onSelect?: (asset: MediaAsset) => void;
  className?: string;
  searchQuery?: string;
  hideHeader?: boolean;
  refreshKey?: number;
  onPathChange?: (
    path: MediaLibraryPathItem[],
    navigateToPathIndex: (index: number) => void,
  ) => void;
}

type SelectedItem =
  | { type: "folder"; data: MediaFolder }
  | { type: "asset"; data: MediaAsset }
  | null;

export function MediaLibraryView({
  projectId,
  siteId,
  onSelect,
  className,
  searchQuery,
  hideHeader,
  refreshKey,
  onPathChange,
}: MediaLibraryViewProps) {
  const { t } = useTranslation();
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<MediaLibraryPathItem[]>([
    { id: null, name: t("mediaLibrary.projectRoot") },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);

  const search = searchQuery !== undefined ? searchQuery : internalSearch;

  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverBreadcrumbId, setDragOverBreadcrumbId] = useState<
    string | null
  >(null);

  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  // Dialog states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "folder" | "asset";
    id: string;
    name: string;
  } | null>(null);

  const fetchContent = useCallback(
    async (folderId: string | null) => {
      setIsLoading(true);
      try {
        const isForcingSiteRoot =
          siteId && !hasAutoNavigated && folderId === null;

        const folderQuery = `?${folderId ? `parentId=${folderId}` : ""}${isForcingSiteRoot ? `&siteId=${siteId}` : ""}`;
        const folderRes = await api.getMediaFolders<any>(
          projectId,
          folderQuery,
        );

        const assetQuery = `?${folderId ? `folderId=${folderId}` : ""}&search=${search}`;
        const assetRes = await api.getMediaAssets<any>(projectId, assetQuery);

        const folderData = folderRes.data || [];
        const assetData = assetRes.data || [];

        if (folderData.rootFolder && isForcingSiteRoot) {
          setFolders(folderData.folders || []);
          setCurrentFolderId(folderData.rootFolder.id);
          setPath([
            { id: null, name: t("mediaLibrary.projectRoot") },
            { id: folderData.rootFolder.id, name: folderData.rootFolder.name },
          ]);
          setHasAutoNavigated(true);
        } else {
          setFolders(folderData);
        }
        setAssets(assetData);
        setSelectedItem(null); // Clear selection on folder change
      } catch (err) {
        toast.error(t("mediaLibrary.toastLoadError"));
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, siteId, search, hasAutoNavigated],
  );

  useEffect(() => {
    if (projectId) {
      fetchContent(currentFolderId);
    }
  }, [currentFolderId, search, refreshKey, fetchContent, projectId]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      if (currentFolderId) formData.append("folderId", currentFolderId);

      toast.promise(
        api
          .uploadMediaAsset(projectId, formData)
          .then((res) => {
            if (!res.success) throw new Error(res.error || "Failed to upload");
            return res.data;
          })
          .then(() => {
            fetchContent(currentFolderId);
          }),
        {
          loading: t("mediaLibrary.toastUploadLoading"),
          success: t("mediaLibrary.toastUploadSuccess"),
          error: t("mediaLibrary.toastUploadError"),
        },
      );
    },
    [projectId, currentFolderId, fetchContent],
  );

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    noClick: true,
  });

  const navigateToFolder = (folder: MediaFolder) => {
    setCurrentFolderId(folder.id);
    setPath([...path, { id: folder.id, name: folder.name }]);
  };

  const navigateToPathIndex = useCallback(
    (index: number) => {
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    },
    [path],
  );

  useEffect(() => {
    onPathChange?.(path, navigateToPathIndex);
  }, [path, onPathChange, navigateToPathIndex]);

  const navigateUp = () => {
    if (path.length > 1) {
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "folder") {
        const res = await api.deleteMediaFolder(projectId, deleteConfirm.id);
        if (!res.success) throw new Error(res.error || "Error deleting folder");
        toast.success(t("mediaLibrary.toastFolderDeleted"));
      } else {
        const res = await api.deleteMediaAsset(projectId, deleteConfirm.id);
        if (!res.success) throw new Error(res.error || "Error deleting asset");
        toast.success(t("mediaLibrary.toastAssetDeleted"));
      }
      if (selectedItem?.data.id === deleteConfirm.id) setSelectedItem(null);
      fetchContent(currentFolderId);
    } catch {
      toast.error(t("mediaLibrary.toastDeleteError"));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const downloadAsset = (url: string, filename: string) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch(() => toast.error(t("mediaLibrary.toastDownloadError")));
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(t("mediaLibrary.toastUrlCopied"));
  };

  const handleDragStart = (
    e: React.DragEvent,
    id: string,
    type: "asset" | "folder",
  ) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ id, type }));
    e.dataTransfer.effectAllowed = "move";

    const preview = document.createElement("div");
    const icon = type === "asset"
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
    preview.innerHTML = `${icon}<span>${type === "asset" ? t("mediaLibrary.moveAsset") : t("mediaLibrary.moveFolder")}</span>`;
    preview.style.position = "fixed";
    preview.style.top = "-1000px";
    preview.style.left = "-1000px";
    preview.style.display = "flex";
    preview.style.alignItems = "center";
    preview.style.gap = "8px";
    preview.style.padding = "8px 12px";
    preview.style.borderRadius = "10px";
    preview.style.border = "1px solid hsl(var(--primary) / 0.35)";
    preview.style.background = "hsl(var(--background) / 0.96)";
    preview.style.color = "hsl(var(--foreground))";
    preview.style.fontSize = "13px";
    preview.style.fontWeight = "600";
    preview.style.backdropFilter = "blur(8px)";
    preview.style.boxShadow = "0 12px 32px rgb(0 0 0 / 0.22), 0 0 0 3px hsl(var(--primary) / 0.12)";
    document.body.appendChild(preview);
    e.dataTransfer.setDragImage(preview, 18, 18);
    window.setTimeout(() => preview.remove(), 0);
  };

  const handleDropOnFolder = async (
    e: React.DragEvent,
    targetFolderId: string | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const dataString = e.dataTransfer.getData("application/json");
    if (!dataString) return;

    try {
      const data = JSON.parse(dataString);
      if (data.type === "asset") {
        const res = await api.moveMediaAsset(
          projectId,
          data.id,
          targetFolderId,
        );
        if (!res.success) throw new Error();
        toast.success(t("mediaLibrary.toastAssetMoved"));
        fetchContent(currentFolderId);
      }
    } catch {
      toast.error(t("mediaLibrary.toastMoveError"));
    }
  };

  const handleDragLeaveFolder = () => setDragOverFolderId(null);
  const handleDragLeaveBreadcrumb = () => setDragOverBreadcrumbId(null);

  return (
    <div
      className={`relative flex h-full w-full overflow-hidden bg-background ${className || ""}`}
    >
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Sticky Header / Toolbar */}
        {!hideHeader && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              {path.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mr-1"
                  onClick={navigateUp}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-1.5">
                {path.map((p, i) => (
                  <React.Fragment key={p.id || "root"}>
                    <span
                      className={`cursor-pointer px-2 py-1 rounded-md transition-all border ${
                        dragOverBreadcrumbId === (p.id || "root")
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent hover:bg-muted text-foreground"
                      }`}
                      onClick={() => {
                        navigateToPathIndex(i);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverBreadcrumbId(p.id || "root");
                      }}
                      onDragLeave={handleDragLeaveBreadcrumb}
                      onDrop={(e) => {
                        setDragOverBreadcrumbId(null);
                        handleDropOnFolder(e, p.id);
                      }}
                    >
                      {p.name}
                    </span>
                    {i < path.length - 1 && (
                      <span className="text-muted-foreground/40">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={openFileDialog} variant="default" size="sm" className="h-9">
                <Upload className="mr-2 h-4 w-4" /> {t("mediaLibrary.uploadBtn")}
              </Button>
              <Input
                placeholder={t("mediaLibrary.searchPlaceholder")}
                value={search}
                onChange={(e) => setInternalSearch(e.target.value)}
                className="w-56 bg-background hidden sm:block h-9"
              />
            </div>
          </div>
        )}

        {/* Scrollable Grid Area */}
        <div
          {...getRootProps()}
          className={`flex-1 overflow-y-auto p-4 transition-colors ${selectedItem ? "pr-[23rem]" : ""} ${isDragActive ? "bg-primary/5 ring-inset ring-2 ring-primary/20" : "bg-muted/10"}`}
          onClick={(e) => {
            // Deselect if clicking on empty background
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <input {...getInputProps()} />

          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full min-h-[300px]">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                <p className="text-sm font-medium animate-pulse">{t("mediaLibrary.loadingMedia")}</p>
              </div>
            </div>
          ) : folders.length === 0 && assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="bg-background border p-4 rounded-full mb-4 shadow-sm">
                <Upload className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-foreground">
                {t("mediaLibrary.emptyFolder")}
              </p>
              <p className="text-sm opacity-80 mt-1 mb-4">
                {t("mediaLibrary.emptyFolderDesc")}
              </p>
              <Button onClick={openFileDialog} variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" /> {t("mediaLibrary.selectFileBtn")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 content-start">
              {folders.map((folder) => {
                const isSelected =
                  selectedItem?.type === "folder" &&
                  selectedItem.data.id === folder.id;
                return (
                  <ContextMenu key={folder.id}>
                    <ContextMenuTrigger>
                      <div
                        className={`group box-border flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer text-center transition-all border ${
                          dragOverFolderId === folder.id
                            ? "border-primary bg-primary/10 shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]"
                            : isSelected
                              ? "border-primary bg-primary/5 shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]"
                              : "border-transparent hover:border-border hover:bg-accent/50 bg-transparent"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem({ type: "folder", data: folder });
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          navigateToFolder(folder);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverFolderId(folder.id);
                        }}
                        onDragLeave={handleDragLeaveFolder}
                        onDrop={(e) => {
                          setDragOverFolderId(null);
                          handleDropOnFolder(e, folder.id);
                        }}
                      >
                        <Folder className="h-14 w-14 fill-blue-500/20 text-blue-500 transition-transform group-hover:scale-105" />
                        <span
                          className="text-sm font-medium truncate w-full"
                          title={folder.name}
                        >
                          {folder.name}
                        </span>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() =>
                          setDeleteConfirm({
                            type: "folder",
                            id: folder.id,
                            name: folder.name,
                          })
                        }
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> {t("mediaLibrary.ctxDelete")}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}

              {assets.map((asset) => {
                const isSelected =
                  selectedItem?.type === "asset" &&
                  selectedItem.data.id === asset.id;
                return (
                  <ContextMenu key={asset.id}>
                    <ContextMenuTrigger>
                      <div
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, asset.id, "asset")
                        }
                        className={`group relative box-border flex flex-col rounded-xl border bg-background shadow-sm cursor-pointer overflow-hidden transition-shadow ${
                          isSelected
                            ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]"
                            : "hover:border-border hover:shadow-md"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem({ type: "asset", data: asset });
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (onSelect) onSelect(asset);
                        }}
                      >
                        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                          {asset.mime_type.startsWith("image/") ? (
                            <img
                              src={asset.file_url}
                              alt={asset.file_name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                            />
                          ) : (
                            <FileIcon className="h-12 w-12 text-muted-foreground/60 transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
                          )}
                        </div>
                        <div className="p-2.5 border-t bg-card flex items-center justify-center">
                          <span
                            className="text-xs font-medium truncate w-full text-center"
                            title={asset.file_name}
                          >
                            {asset.file_name}
                          </span>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => copyToClipboard(asset.file_url)}
                      >
                        <Copy className="mr-2 h-4 w-4" /> {t("mediaLibrary.ctxCopyUrl")}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          downloadAsset(asset.file_url, asset.file_name)
                        }
                      >
                        <Download className="mr-2 h-4 w-4" /> {t("mediaLibrary.ctxDownload")}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() =>
                          setDeleteConfirm({
                            type: "asset",
                            id: asset.id,
                            name: asset.file_name,
                          })
                        }
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> {t("mediaLibrary.ctxDelete")}
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR AREA */}
      {selectedItem && (
        <div className="absolute right-3 top-3 bottom-3 z-20 w-80 rounded-xl border bg-card/95 backdrop-blur flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">{t("mediaLibrary.propTitle")}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSelectedItem(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {selectedItem.type === "folder" && (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-20 w-20 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-2">
                  <Folder className="h-12 w-12 fill-blue-500/20" />
                </div>
                <div className="space-y-1 w-full">
                  <h4 className="font-semibold break-words">
                    {selectedItem.data.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{t("mediaLibrary.propFolder")}</p>
                </div>

                <div className="w-full pt-4 border-t space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigateToFolder(selectedItem.data)}
                  >
                    <Folder className="mr-2 h-4 w-4" /> {t("mediaLibrary.propOpenFolder")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() =>
                      setDeleteConfirm({
                        type: "folder",
                        id: selectedItem.data.id,
                        name: selectedItem.data.name,
                      })
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t("mediaLibrary.propDeleteFolder")}
                  </Button>
                </div>
              </div>
            )}

            {selectedItem.type === "asset" && (
              <div className="flex flex-col space-y-6">
                <div className="rounded-xl overflow-hidden border bg-muted/30 aspect-[4/3] flex items-center justify-center">
                  {selectedItem.data.mime_type.startsWith("image/") ? (
                    <img
                      src={selectedItem.data.file_url}
                      alt={selectedItem.data.file_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <FileIcon className="h-16 w-16 text-muted-foreground/50" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-semibold text-sm break-words leading-tight">
                    {selectedItem.data.file_name}
                  </h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {selectedItem.data.mime_type.split("/")[1] || t("mediaLibrary.propAsset")}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      {t("mediaLibrary.propAssetUrl")}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={selectedItem.data.file_url}
                        className="h-8 text-xs bg-muted/50"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 shrink-0"
                        onClick={() =>
                          copyToClipboard(selectedItem.data.file_url)
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  {onSelect && (
                    <Button
                      className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => onSelect(selectedItem.data)}
                    >
                      <FileIcon className="mr-2 h-4 w-4" /> {t("mediaLibrary.propSelect")}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() =>
                      downloadAsset(
                        selectedItem.data.file_url,
                        selectedItem.data.file_name,
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" /> {t("mediaLibrary.propDownload")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() =>
                      setDeleteConfirm({
                        type: "asset",
                        id: selectedItem.data.id,
                        name: selectedItem.data.file_name,
                      })
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t("mediaLibrary.propDeleteAsset")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIALOGS */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("mediaLibrary.dialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === "folder"
                ? t("mediaLibrary.dialogFolderDesc", { name: deleteConfirm.name })
                : t("mediaLibrary.dialogAssetDesc", { name: deleteConfirm?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("mediaLibrary.dialogCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("mediaLibrary.dialogConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
