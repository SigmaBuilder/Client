import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/hooks/use-workspace";
import { api } from "@/lib/api";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft, Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SvglIcon {
  id: number;
  title: string;
  route: string | { light: string; dark: string };
  category: string | string[];
}

export default function PortfolioStackForm() {
  const { currentSite } = useWorkspace();
  const navigate = useNavigate();
  const { stackId } = useParams();
  const isEditing = !!stackId;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon_url: "",
  });

  // State para la busqueda en SVGL
  const [svglQuery, setSvglQuery] = useState("");
  const [svglResults, setSvglResults] = useState<SvglIcon[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSvglDropdown, setShowSvglDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sectionsPath = `/dashboard/site/${currentSite?.slug}/portfolio/stack`;

  useEffect(() => {
    if (isEditing && currentSite?.id && stackId) {
      const fetchItem = async () => {
        try {
          const res = await api.getPortfolioStackItem<{ portfolioStack: any }>(currentSite.id, stackId);
          if (res.success && res.data) {
            setFormData({
              name: res.data.portfolioStack.name || "",
              icon_url: res.data.portfolioStack.icon_url || "",
            });
          } else {
            toast.error("Error al cargar la tecnología");
            navigate(sectionsPath);
          }
        } catch {
          toast.error("Error de conexión");
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [currentSite?.id, stackId, isEditing, navigate, sectionsPath]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSvglDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchSvgl = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSvglResults([]);
      setShowSvglDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.svgl.app?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data: SvglIcon[] = await response.json();
        setSvglResults(data.slice(0, 20));
        setShowSvglDropdown(true);
      }
    } catch {
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSvglQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSvglQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchSvgl(value), 300);
  };

  const getIconUrl = (icon: SvglIcon): string => {
    if (typeof icon.route === "string") return icon.route;
    return icon.route.light;
  };

  const selectSvglIcon = (icon: SvglIcon) => {
    const url = getIconUrl(icon);
    setFormData(prev => ({ ...prev, name: prev.name || icon.title, icon_url: url }));
    setSvglQuery("");
    setShowSvglDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentSite?.id) return;
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        icon_url: formData.icon_url || undefined,
      };

      let res;
      if (isEditing && stackId) {
        res = await api.updatePortfolioStackItem(currentSite.id, stackId, payload);
      } else {
        res = await api.createPortfolioStackItem(currentSite.id, payload);
      }

      if (res.success) {
        toast.success(isEditing ? "Tecnología actualizada" : "Tecnología añadida");
        navigate(sectionsPath);
      } else {
        toast.error(res.error || "Error al guardar");
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
      { label: "Stack", onClick: () => navigate(sectionsPath) },
      { label: isEditing ? "Editar Tecnología" : "Nueva Tecnología" }
    ],
    actions: (
      <Button size="sm" onClick={handleSave} disabled={isSaving || isLoading}>
        <Save className="h-4 w-4 mr-2" />
        Guardar
      </Button>
    ),
  }), [isEditing, navigate, handleSave, isSaving, isLoading, sectionsPath]);

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
        <Button variant="ghost" size="sm" onClick={() => navigate(sectionsPath)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-xl font-semibold tracking-tight">
          {isEditing ? "Editar Tecnología" : "Añadir Tecnología"}
        </h2>
      </div>

      <div className="space-y-6 bg-card border rounded-md p-6">
        <div className="space-y-2" ref={dropdownRef}>
          <Label>Buscar icono en SVGL</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={svglQuery}
              onChange={handleSvglQueryChange}
              onFocus={() => svglResults.length > 0 && setShowSvglDropdown(true)}
              placeholder="Buscar React, TypeScript, Node..."
              className="pl-9"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {showSvglDropdown && svglResults.length > 0 && (
            <div className="absolute z-50 w-full max-w-[calc(100%-3rem)] max-h-64 overflow-auto rounded-md border bg-popover shadow-md mt-1">
              {svglResults.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                  onClick={() => selectSvglIcon(icon)}
                >
                  <img
                    src={getIconUrl(icon)}
                    alt={icon.title}
                    className="h-6 w-6 object-contain shrink-0"
                  />
                  <span className="truncate font-medium">{icon.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground truncate">
                    {Array.isArray(icon.category) ? icon.category.join(", ") : icon.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {formData.icon_url && (
          <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
            <img
              src={formData.icon_url}
              alt="Preview"
              className="h-10 w-10 object-contain"
            />
            <span className="text-sm font-medium truncate flex-1">{formData.name || "Sin nombre"}</span>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setFormData(prev => ({ ...prev, icon_url: "" }))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la tecnología</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej. React, TypeScript, Node.js"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon_url">URL del icono (opcional)</Label>
          <Input
            id="icon_url"
            name="icon_url"
            value={formData.icon_url}
            onChange={handleChange}
            placeholder="https://svgl.app/library/react.svg"
          />
          <p className="text-xs text-muted-foreground">
            Puedes usar el buscador de SVGL arriba o pegar una URL directa.
          </p>
        </div>
      </div>
    </div>
  );
}
