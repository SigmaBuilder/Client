import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioSectionForm() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const isEditing = !!sectionId;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    sort_order: 0,
    subtitle: "",
    description: "",
  });

  useEffect(() => {
    if (isEditing && currentSite?.id) {
      const fetchSection = async () => {
        try {
          const res = await api.getPortfolioSection<{ portfolioSection: any }>(currentSite.id, sectionId);
          if (res.success && res.data) {
            const content = res.data.portfolioSection.content || {};
            setFormData({
              title: res.data.portfolioSection.title || "",
              sort_order: res.data.portfolioSection.sort_order || 0,
              subtitle: content.subtitle || "",
              description: content.description || "",
            });
          } else {
            toast.error("Error al cargar la sección");
            navigate(`/dashboard/site/${currentSite.slug}/portfolio/sections`);
          }
        } catch {
          toast.error("Error de conexión");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSection();
    }
  }, [currentSite?.id, sectionId, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sort_order' ? parseInt(value) || 0 : value
    }));
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
        sort_order: formData.sort_order,
        content: {
          subtitle: formData.subtitle,
          description: formData.description,
        }
      };

      let res;
      if (isEditing) {
        res = await api.updatePortfolioSection(currentSite.id, sectionId, payload);
      } else {
        res = await api.createPortfolioSection(currentSite.id, payload);
      }

      if (res.success) {
        toast.success(isEditing ? "Sección actualizada" : "Sección creada");
        navigate(`/dashboard/site/${currentSite.slug}/portfolio/sections`);
      } else {
        toast.error(res.error || "Error al guardar la sección");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const headerState = useMemo(() => ({
    breadcrumbs: [
      { label: "Portfolio" },
      { label: "Secciones", onClick: () => navigate(`/dashboard/site/${currentSite?.slug}/portfolio/sections`) },
      { label: isEditing ? "Editar Sección" : "Nueva Sección" }
    ],
    actions: (
      <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Guardar
      </Button>
    ),
  }), [isEditing, navigate, handleSave, isSaving, isLoading]);

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
    <div className="p-6 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/site/${currentSite?.slug}/portfolio/sections`)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-xl font-semibold tracking-tight">
          {isEditing ? "Editar Sección" : "Crear Nueva Sección"}
        </h2>
      </div>

      <div className="space-y-6 bg-card border rounded-md p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título de la sección</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej. Sobre Mi"
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

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
          <Input
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder="Ej. Conoce un poco más sobre mi trayectoria"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            name="description"
            className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.description}
            onChange={handleChange}
            placeholder="Escribe el contenido principal de la sección aquí..."
          />
        </div>
      </div>
    </div>
  );
}
