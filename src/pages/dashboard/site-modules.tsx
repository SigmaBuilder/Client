import { useMemo, useState } from "react";
import { Briefcase, CheckCircle2, CircleDashed, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { Site } from "@/types/project";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const AVAILABLE_MODULES = [
  {
    key: "blog",
    title: "Blog",
    subtitle: "Publicación y contenido editorial",
    description: "Crea un blog completo para publicar artículos, organizarlos por categorías y mantener un flujo editorial dentro del sitio.",
    icon: Newspaper,
    functions: [
      "Gestión de posts con creación, edición y eliminación.",
      "Organización por categorías para estructurar el contenido.",
      "Accesos directos en la sidebar a Posts y Categorías.",
      "Preparado para contenido editorial asociado al sitio actual.",
    ],
  },
  {
    key: "portfolio",
    title: "Portfolio",
    subtitle: "Proyectos, secciones y tecnologías",
    description: "Activa las herramientas para construir un portfolio profesional con proyectos, secciones personalizadas y stack tecnológico.",
    icon: Briefcase,
    functions: [
      "Gestión de secciones para ordenar el contenido del portfolio.",
      "Listado de proyectos con creación, edición y eliminación.",
      "Administración del stack tecnológico usado en cada sitio.",
      "Accesos directos en la sidebar a Secciones, Proyectos y Stack.",
    ],
  },
];

export default function SiteModulesPage() {
  const { currentSite, isLoading, setCurrentSite } = useWorkspace();
  const [savingModule, setSavingModule] = useState<string | null>(null);

  const modules = currentSite?.features?.modules ?? {};
  const activeCount = AVAILABLE_MODULES.filter((module) => modules[module.key] === true).length;

  const headerState = useMemo(() => ({
    breadcrumbs: [{ label: "Módulos" }],
    actions: (
      <Badge variant="outline">
        {activeCount} activos
      </Badge>
    ),
  }), [activeCount]);

  useSetSitePageHeader(headerState);

  const handleModuleChange = async (moduleKey: string, checked: boolean) => {
    if (!currentSite?.id) return;

    const nextFeatures = {
      ...(currentSite.features ?? {}),
      modules: {
        ...(currentSite.features?.modules ?? {}),
        [moduleKey]: checked,
      },
    };

    setSavingModule(moduleKey);

    try {
      const res = await api.updateSite<{ site: Site }>(currentSite.id, {
        features: nextFeatures,
      });

      if (res.success && res.data?.site) {
        setCurrentSite(res.data.site);
        toast.success(checked ? "Módulo activado" : "Módulo desactivado");
      } else {
        toast.error(res.error || "No se pudo actualizar el módulo");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingModule(null);
    }
  };

  if (isLoading || !currentSite) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Módulos del sitio</CardTitle>
          <CardDescription>
            Controla qué funciones están disponibles para este sitio. Solo los módulos activos aparecen en la sidebar.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {AVAILABLE_MODULES.map((module) => {
          const Icon = module.icon;
          const checked = modules[module.key] === true;
          const isSaving = savingModule === module.key;

          return (
            <Card key={module.key} className="min-h-full">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&>svg]:size-5">
                    <Icon />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.subtitle}</CardDescription>
                  </div>
                </div>
                <CardAction>
                  <Badge variant={checked ? "default" : "secondary"}>
                    {checked ? (
                      <CheckCircle2 data-icon="inline-start" />
                    ) : (
                      <CircleDashed data-icon="inline-start" />
                    )}
                    {checked ? "Activo" : "Inactivo"}
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Funciones incluidas</p>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {module.functions.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">
                    {checked ? "Módulo disponible" : "Módulo oculto"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {checked ? "Se muestra en la navegación del sitio." : "No aparece en la sidebar del sitio."}
                  </p>
                </div>
                <Switch
                  checked={checked}
                  disabled={isSaving}
                  aria-label={`${checked ? "Desactivar" : "Activar"} ${module.title}`}
                  onCheckedChange={(value) => handleModuleChange(module.key, value)}
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
