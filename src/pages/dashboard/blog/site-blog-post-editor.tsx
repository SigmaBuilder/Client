import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/shared/TiptapEditor";
import { MediaLibraryManager } from "@/components/shared/MediaLibrary/MediaLibraryManager";
import { MediaAsset } from "@/components/shared/MediaLibrary/MediaLibraryView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

export default function SiteBlogPostEditorPage() {
  const { currentSite } = useWorkspace();
  const { postId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(postId && postId !== "new");

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category_id: "",
    status: "draft",
    cover_image: "",
    content: "",
  });

  const [editorValue, setEditorValue] = useState<any>();

  useEffect(() => {
    if (currentSite?.id) {
      api.getBlogCategories<any>(currentSite.id).then((res) => {
        if (res.success && res.data?.blogCategories) setCategories(res.data.blogCategories);
      });

      if (isEditing) {
        setLoading(true);
        api.getBlogPost<any>(currentSite.id, postId!).then((res) => {
          if (res.success && res.data?.blogPost) {
             const post = res.data.blogPost;
             setFormData({
               title: post.title || "",
               slug: post.slug || "",
               excerpt: post.excerpt || "",
               category_id: post.category_id || "",
               status: post.status || "draft",
               cover_image: post.cover_image || "",
               content: post.content || "",
             });
             if (post.content) {
                try {
                   // Si el post.content es un string JSON válido, se parsea
                   setEditorValue(JSON.parse(post.content));
                } catch {
                   // Si falla, significa que probablemente sea HTML o un string simple
                   console.error("Failed to parse tiptap content, using raw");
                   setEditorValue(post.content);
                }
             }
          }
          setLoading(false);
        }).catch(() => {
           toast.error("Error al cargar post");
           setLoading(false);
        });
      }
    }
  }, [currentSite?.id, postId, isEditing]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!currentSite?.id) return;
    if (!formData.title || !formData.slug) {
      toast.error("El título y el slug son obligatorios");
      return;
    }

    const payload = {
      ...formData,
      content: editorValue ? JSON.stringify(editorValue) : "",
      category_id: formData.category_id || null,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await api.updateBlogPost(currentSite.id, postId!, payload);
        toast.success("Post actualizado");
      } else {
        const res = await api.createBlogPost<any>(currentSite.id, payload);
        if (res.success && res.data?.blogPost) {
           toast.success("Post creado");
           navigate(`/dashboard/site/${currentSite.slug}/blog/posts/${res.data.blogPost.id}`);
        }
      }
    } catch (err: any) {
      toast.error("Error al guardar post");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="p-8">Cargando editor...</div>;
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      
      {/* Main Content Area (Left) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r relative">
        
        {/* Sticky Header / Toolbar for the post */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur z-20">
          <div className="flex items-center gap-4">
            <Link to={`/dashboard/site/${currentSite?.slug}/blog/posts`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Blog</span>
              <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-[400px]">
                {formData.title || "Sin título"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="secondary" size="sm" onClick={() => setFormData({...formData, status: formData.status === 'published' ? 'draft' : 'published'})}>
              {formData.status === 'published' ? 'Cambiar a Borrador' : 'Publicar'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>

        {/* Editor scrollable area */}
        <div className="flex-1 overflow-y-auto relative">
          <div className="max-w-[850px] mx-auto w-full px-6 sm:px-12 py-12 flex flex-col">
            
            {/* Native looking title input */}
            <input
              id="title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Título del post..."
              className="text-4xl md:text-5xl font-extrabold tracking-tight bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/30 resize-none mb-6"
            />

            {/* Tiptap Editor */}
            {currentSite && (
              <TiptapEditor 
                value={editorValue} 
                onChange={setEditorValue} 
                projectId={currentSite.project_id || ''}
                siteId={currentSite.id || ''}
                className="flex-1 min-h-[500px]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Properties Area (Right) */}
      <div className="w-80 shrink-0 bg-muted/10 overflow-y-auto hidden lg:block">
        <div className="p-6 space-y-8">
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground/80">Propiedades del post</h3>
            <div className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground uppercase">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="status" className="w-full bg-background">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-semibold text-muted-foreground uppercase">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej-tendencias-2024"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-semibold text-muted-foreground uppercase">Categoría</Label>
                <Select
                  value={formData.category_id || "none"}
                  onValueChange={(val) => setFormData({ ...formData, category_id: val === "none" ? "" : val })}
                >
                  <SelectTrigger id="category" className="w-full bg-background">
                    <SelectValue placeholder="Ninguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Imagen de Portada</Label>
                {formData.cover_image ? (
                  <div className="relative rounded-lg overflow-hidden border shadow-sm group">
                     <img src={formData.cover_image} alt="Cover" className="w-full aspect-video object-cover transition-transform group-hover:scale-105" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 shadow-md"
                          onClick={() => setFormData({...formData, cover_image: ''})}
                        >
                          <X className="h-4 w-4 mr-2" /> Quitar
                        </Button>
                     </div>
                  </div>
                ) : currentSite && (
                  <div className="aspect-video bg-background border border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center hover:bg-muted/50 transition-colors">
                     <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-3" />
                     <MediaLibraryManager 
                       projectId={currentSite.project_id || ''} 
                       siteId={currentSite.id || ''} 
                       onSelect={(asset: MediaAsset) => {
                          setFormData({...formData, cover_image: asset.file_url});
                       }}
                       trigger={
                          <Button variant="secondary" size="sm" className="shadow-sm">
                            Añadir Portada
                          </Button>
                       }
                     />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-xs font-semibold text-muted-foreground uppercase">Extracto</Label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve descripción para SEO..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
