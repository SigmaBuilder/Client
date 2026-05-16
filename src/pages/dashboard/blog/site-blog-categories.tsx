import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function SiteBlogCategoriesPage() {
  const { currentSite } = useWorkspace();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const fetchCategories = async () => {
    if (!currentSite?.id) return;
    setLoading(true);
    try {
      const res = await api.getBlogCategories<any>(currentSite.id);
      if (res.success && res.data?.blogCategories) {
        setCategories(res.data.blogCategories);
      }
    } catch (err) {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSite?.id) {
      fetchCategories();
    }
  }, [currentSite?.id]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, slug: category.slug });
    } else {
      setEditingId(null);
      setFormData({ name: "", slug: "" });
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite?.id) return;
    try {
      if (editingId) {
        await api.updateBlogCategory(currentSite.id, editingId, formData);
        toast.success("Categoría actualizada");
      } else {
        await api.createBlogCategory(currentSite.id, formData);
        toast.success("Categoría creada");
      }
      setIsOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error("Error al guardar categoría");
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentSite?.id) return;
    if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await api.deleteBlogCategory(currentSite.id, id);
      toast.success("Categoría eliminada");
      fetchCategories();
    } catch (err) {
      toast.error("Error al eliminar categoría");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !editingId ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : prev.slug,
    }));
  };

  if (loading) {
    return <div className="p-8">Cargando categorías...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categorías de Blog</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <div className="w-full">
          <div className="border-b px-4 py-3 flex items-center justify-between font-medium text-sm text-muted-foreground bg-muted/50">
            <div className="w-1/3">Nombre</div>
            <div className="w-1/3">Slug</div>
            <div className="w-1/3 text-right">Acciones</div>
          </div>
          <div className="divide-y">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Tag className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>No hay categorías creadas aún.</p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-1/3 font-medium">{category.name}</div>
                  <div className="w-1/3 text-muted-foreground text-sm">{category.slug}</div>
                  <div className="w-1/3 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Ej: Tecnología"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="ej-tecnologia"
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
