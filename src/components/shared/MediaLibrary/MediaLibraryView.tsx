import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Folder, File as FileIcon, Upload, ArrowLeft, Plus, Download, Trash2 } from 'lucide-react';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';

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

export interface MediaLibraryViewProps {
  projectId: string;
  siteId?: string;
  onSelect?: (asset: MediaAsset) => void;
  className?: string;
}

export function MediaLibraryView({ projectId, siteId, onSelect, className }: MediaLibraryViewProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<{id: string | null, name: string}[]>([{ id: null, name: 'Proyecto' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchContent = useCallback(async (folderId: string | null) => {
    setIsLoading(true);
    try {
      // Si estamos pidiendo explicitamente la raiz (folderId=null) Y NO es la carga inicial forzada por siteId
      // vamos a omitir el siteId para no recaer en la carpeta del site root
      const isForcingSiteRoot = siteId && path.length === 1 && path[0].id === null && folderId === null;
      
      const folderQuery = `?${folderId ? `parentId=${folderId}` : ''}${isForcingSiteRoot ? `&siteId=${siteId}` : ''}`;
      const folderRes = await api.getMediaFolders<any>(projectId, folderQuery);
      
      const assetQuery = `?${folderId ? `folderId=${folderId}` : ''}&search=${search}`;
      const assetRes = await api.getMediaAssets<any>(projectId, assetQuery);
      
      const folderData = folderRes.data || [];
      const assetData = assetRes.data || [];

      if (folderData.rootFolder && isForcingSiteRoot) {
         setFolders(folderData.folders || []);
         setCurrentFolderId(folderData.rootFolder.id);
         setPath([{ id: null, name: 'Proyecto' }, { id: folderData.rootFolder.id, name: folderData.rootFolder.name }]);
      } else {
         setFolders(folderData);
      }
      setAssets(assetData);
    } catch (err) {
      toast.error('Error al cargar la librería de medios');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, siteId, search, path]);

  useEffect(() => {
    if (projectId) {
      fetchContent(currentFolderId);
    }
  }, [currentFolderId, search, fetchContent, projectId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (currentFolderId) formData.append('folderId', currentFolderId);

    toast.promise(
      api.uploadMediaAsset(projectId, formData).then((res) => {
        if (!res.success) throw new Error(res.error || 'Failed to upload');
        return res.data;
      }).then(() => {
        fetchContent(currentFolderId);
      }),
      {
        loading: 'Subiendo archivo...',
        success: 'Archivo subido',
        error: 'Error al subir',
      }
    );
  }, [projectId, currentFolderId, fetchContent]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const navigateToFolder = (folder: MediaFolder) => {
    setCurrentFolderId(folder.id);
    setPath([...path, { id: folder.id, name: folder.name }]);
  };

  const navigateUp = () => {
    if (path.length > 1) {
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  };

  const createFolder = async () => {
    const name = prompt('Nombre de la nueva carpeta:');
    if (!name) return;
    
    try {
      const res = await api.createMediaFolder(projectId, name, currentFolderId);
      if (!res.success) throw new Error(res.error || 'Failed to create folder');
      
      fetchContent(currentFolderId);
      toast.success('Carpeta creada');
    } catch {
      toast.error('Error al crear carpeta');
    }
  };

  const deleteAsset = async (assetId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;
    try {
      const res = await api.deleteMediaAsset(projectId, assetId);
      if (!res.success) throw new Error(res.error || 'Error deleting asset');
      toast.success('Archivo eliminado');
      fetchContent(currentFolderId);
    } catch {
      toast.error('Error al eliminar archivo');
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta carpeta y todo su contenido?')) return;
    try {
      const res = await api.deleteMediaFolder(projectId, folderId);
      if (!res.success) throw new Error(res.error || 'Error deleting folder');
      toast.success('Carpeta eliminada');
      fetchContent(currentFolderId);
    } catch {
      toast.error('Error al eliminar carpeta');
    }
  };

  const downloadAsset = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch(() => toast.error('Error al descargar archivo'));
  };

  const handleDragStart = (e: React.DragEvent, id: string, type: 'asset' | 'folder') => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id, type }));
  };

  const handleDropOnFolder = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const dataString = e.dataTransfer.getData('application/json');
    if (!dataString) return; // Might be a real file upload handled by dropzone

    try {
      const data = JSON.parse(dataString);
      if (data.type === 'asset') {
        const res = await api.moveMediaAsset(projectId, data.id, targetFolderId);
        if (!res.success) throw new Error();
        toast.success('Archivo movido');
        fetchContent(currentFolderId);
      }
      // Note: Moving folders would require a new API endpoint, skipping for now to keep it simple.
    } catch {
      toast.error('Error al mover elemento');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" onClick={navigateUp} disabled={path.length <= 1}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {path.map((p, i) => (
                <React.Fragment key={p.id || 'root'}>
                  <span 
                    className="cursor-pointer hover:text-foreground p-1 rounded hover:bg-muted"
                    onClick={() => {
                      const newPath = path.slice(0, i + 1);
                      setPath(newPath);
                      setCurrentFolderId(p.id);
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnFolder(e, p.id)}
                  >
                    {p.name}
                  </span>
                  {i < path.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Buscar..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />
          <Button variant="secondary" size="sm" onClick={createFolder}>
            <Plus className="h-4 w-4 mr-2" />
            Carpeta
          </Button>
          <Button size="sm" className="relative">
            <Upload className="h-4 w-4 mr-2" />
            Subir
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                if(e.target.files) onDrop(Array.from(e.target.files));
            }} />
          </Button>
        </div>
      </div>

      {/* Grid Area */}
      <div 
        {...getRootProps()} 
        className={`flex-1 overflow-y-auto border rounded-md p-4 transition-colors ${isDragActive ? 'bg-primary/5 border-primary' : 'bg-background'}`}
      >
        <input {...getInputProps()} />
        
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Cargando...</div>
        ) : folders.length === 0 && assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>Esta carpeta está vacía.</p>
              <p className="text-sm">Arrastra archivos aquí para subirlos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {folders.map(folder => (
              <ContextMenu key={folder.id}>
                <ContextMenuTrigger>
                  <div 
                    className="flex flex-col items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer text-center"
                    onDoubleClick={() => navigateToFolder(folder)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnFolder(e, folder.id)}
                  >
                    <Folder className="h-12 w-12 text-blue-500 fill-blue-500/20" />
                    <span className="text-xs truncate w-full" title={folder.name}>{folder.name}</span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => deleteFolder(folder.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
            
            {assets.map(asset => (
              <ContextMenu key={asset.id}>
                <ContextMenuTrigger>
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset.id, 'asset')}
                    className="flex flex-col items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer text-center group relative"
                    onClick={() => {
                      if (onSelect) {
                        onSelect(asset);
                      }
                    }}
                  >
                    {asset.mime_type.startsWith('image/') ? (
                      <div className="h-16 w-16 bg-muted rounded-md overflow-hidden">
                        <img src={asset.file_url} alt={asset.file_name} className="h-full w-full object-cover pointer-events-none" />
                      </div>
                    ) : (
                      <FileIcon className="h-12 w-12 text-muted-foreground pointer-events-none" />
                    )}
                    <span className="text-xs truncate w-full" title={asset.file_name}>{asset.file_name}</span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => downloadAsset(asset.file_url, asset.file_name)}>
                    <Download className="mr-2 h-4 w-4" /> Descargar
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => deleteAsset(asset.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
