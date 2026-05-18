import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const newPostUrl = `/dashboard/site/${currentSite?.slug}/blog/posts/new`;

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

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) =>
      [post.title, post.slug, post.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [posts, search]);

  const headerState = useMemo(() => ({
    breadcrumbs: [
      { label: "Blog" },
      { label: "Posts" },
    ],
    search: {
      value: search,
      onChange: setSearch,
      placeholder: "Buscar posts...",
    },
    actions: (
      <>
        <Badge variant="secondary">{posts.length} posts</Badge>
        <Button asChild size="sm">
          <Link to={newPostUrl}>
            <Plus data-icon="inline-start" />
            Nuevo post
          </Link>
        </Button>
      </>
    ),
  }), [newPostUrl, posts.length, search]);

  useSetSitePageHeader(currentSite ? headerState : null);

  const getStatusLabel = (status: string) => {
    if (status === "published") return "Publicado";
    if (status === "archived") return "Archivado";
    return "Borrador";
  };

  const getStatusVariant = (status: string) => {
    if (status === "published") return "default";
    if (status === "archived") return "outline";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Card className="mx-auto w-full max-w-6xl">
        <CardHeader>
          <CardTitle>Posts del blog</CardTitle>
          <CardDescription>Administra borradores, publicaciones y contenido archivado.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
              <FileText className="size-12 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <p className="font-medium text-foreground">
                  {posts.length === 0 ? "Aún no tienes posts" : "No hay posts para esta búsqueda"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {posts.length === 0 ? "Empieza creando tu primer post en el blog." : "Prueba con otro título, slug o estado."}
                </p>
              </div>
              {posts.length === 0 && (
                <Button asChild variant="outline">
                  <Link to={newPostUrl}>Crear un post ahora</Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {post.cover_image ? (
                          <img src={post.cover_image} alt="" className="size-12 rounded-md border object-cover" />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-md border bg-muted">
                            <ImageIcon className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{post.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{post.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(post.status)}>{getStatusLabel(post.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/dashboard/site/${currentSite?.slug}/blog/posts/${post.id}`} aria-label={`Editar ${post.title}`}>
                            <Edit2 />
                          </Link>
                        </Button>
                        <Button variant="destructive" size="icon-sm" onClick={() => handleDelete(post.id)} aria-label={`Eliminar ${post.title}`}>
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
