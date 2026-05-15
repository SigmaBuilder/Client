import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../hooks/use-workspace";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useSetSitePageHeader } from "../../components/site/SitePageHeader";
import { Skeleton } from "../../components/ui/skeleton";
import { Settings, Globe, ArrowLeft, Image as ImageName } from "lucide-react";
import { Button } from "../../components/ui/button";
import DashboardNotFound from "./not-found";

export default function SiteDashboard() {
  const { currentSite, currentProject, isLoading } = useWorkspace();
  const navigate = useNavigate();

  const headerState = useMemo(() => ({
    actions: (
      <>
        <Badge variant="outline">
          <span className="size-1.5 rounded-full bg-emerald-500 inline-block mr-1.5" />
          Activo
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/dashboard/site/${currentSite?.slug}/media`)}
        >
          <ImageName className="mr-2 h-4 w-4" /> Medios
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" /> Ajustes
        </Button>
        <Button size="sm">Editar Sitio</Button>
      </>
    ),
  }), [currentSite?.slug, navigate]);

  useSetSitePageHeader(headerState);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!currentSite && !isLoading) {
    return (
      <div className="p-8">
        <DashboardNotFound />
      </div>
    );
  }

  if (currentSite) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2 mb-2 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/dashboard/${currentSite.project_id}`)}
            className="gap-1 pl-0"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al Proyecto
          </Button>
        </div>

        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-8 w-8 text-primary" />
              {currentSite.slug}
            </h2>
            <p className="text-muted-foreground">
              Dashboard del sitio. Proyecto:{" "}
              {currentProject?.name || "Cargando..."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Activo</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {currentSite.template_type}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Actualizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(currentSite.updated_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(currentSite.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
