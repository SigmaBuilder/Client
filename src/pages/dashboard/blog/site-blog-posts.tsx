import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  cover_image: string | null;
  created_at: string;
}

export default function SiteBlogPostsPage() {
  const { currentSite } = useWorkspace();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!currentSite?.id) return;
    setLoading(true);
    try {
      const res = await api.getBlogPosts<any>(currentSite.id);
      if (res.success && res.data?.blogPosts) {
        setPosts(res.data.blogPosts);
      }
    } catch (err) {
      toast.error("Error al cargar posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSite?.id) {
      fetchPosts();
    }
  }, [currentSite?.id]);

  const handleDelete = async (id: string) => {
    if (!currentSite?.id) return;
    if (!confirm("¿Seguro que deseas eliminar este post?")) return;
    try {
      await api.deleteBlogPost(currentSite.id, id);
      toast.success("Post eliminado");
      fetchPosts();
    } catch (err) {
      toast.error("Error al eliminar post");
    }
  };

  if (loading) {
    return <div className="p-8">Cargando posts...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Posts del Blog</h2>
          <p className="text-muted-foreground mt-1 text-sm">Administra y publica el contenido de tu blog.</p>
        </div>
        <Link to={`/dashboard/site/${currentSite?.slug}/blog/posts/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Post
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <div className="w-full">
          <div className="border-b px-4 py-3 flex items-center justify-between font-medium text-sm text-muted-foreground bg-muted/50">
            <div className="w-1/2">Post</div>
            <div className="w-1/6">Estado</div>
            <div className="w-1/6">Fecha</div>
            <div className="w-1/6 text-right">Acciones</div>
          </div>
          <div className="divide-y">
            {posts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <FileText className="h-12 w-12 opacity-20 mb-4" />
                <p className="text-lg font-medium text-foreground">Aún no tienes posts</p>
                <p className="text-sm mt-1">Empieza creando tu primer post en el blog.</p>
                <Link to={`/dashboard/site/${currentSite?.slug}/blog/posts/new`} className="mt-6">
                  <Button variant="outline">Crear un post ahora</Button>
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-1/2 flex items-center gap-3">
                    {post.cover_image ? (
                       <img src={post.cover_image} alt="cover" className="w-12 h-12 rounded object-cover border" />
                    ) : (
                       <div className="w-12 h-12 rounded bg-muted flex items-center justify-center border">
                          <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                       </div>
                    )}
                    <div>
                      <div className="font-medium text-foreground line-clamp-1">{post.title}</div>
                      <div className="text-muted-foreground text-xs">{post.slug}</div>
                    </div>
                  </div>
                  <div className="w-1/6">
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className={post.status === 'published' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400' : ''}>
                      {post.status === 'published' ? 'Publicado' : post.status === 'archived' ? 'Archivado' : 'Borrador'}
                    </Badge>
                  </div>
                  <div className="w-1/6 text-muted-foreground text-sm">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div className="w-1/6 flex justify-end gap-2">
                    <Link to={`/dashboard/site/${currentSite?.slug}/blog/posts/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
