import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useWorkspace } from "../../hooks/use-workspace";
import { WorkspaceProject } from "../../types/project";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Briefcase, Plus, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import api from "../../lib/api";

export default function ProjectsList() {
  const { projects, isLoading, fetchProjects, clearWorkspace } = useWorkspace();
  const navigate = useNavigate();

  // New project dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    clearWorkspace();
    fetchProjects();
  }, [fetchProjects, clearWorkspace]);

  const openCreateDialog = () => {
    setProjectName("");
    setProjectDescription("");
    setCreateOpen(true);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("El nombre del proyecto es obligatorio");
      return;
    }
    setCreating(true);
    const res = await api.createProject<{ project: WorkspaceProject["project"] }>({
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
    });
    if (res.success && res.data) {
      toast.success(`Proyecto "${res.data.project.name}" creado correctamente`);
      setCreateOpen(false);
      await fetchProjects();
    } else {
      toast.error(res.error ?? "Error creando el proyecto");
    }
    setCreating(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading || projects === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))
        ) : projects !== null && projects.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg border border-dashed">
            <Briefcase className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No tienes proyectos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primer proyecto para empezar a construir sitios.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Crear Proyecto
            </Button>
          </div>
        ) : (
          projects.map((item) => (
            <Card
              key={item.project.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => navigate(`/dashboard/${item.project.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {item.project.name}
                </CardTitle>
                <CardDescription>
                  {item.project.description || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Creado el:{" "}
                  {new Date(item.project.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create project dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-name">Nombre</Label>
              <Input
                id="proj-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={creating}
                placeholder="Nombre del proyecto"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-desc">
                Descripción{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id="proj-desc"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={creating}
                placeholder="Descripción del proyecto"
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleCreateProject} disabled={creating}>
              {creating && <Loader2 className="size-3.5 animate-spin" />}
              Crear proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
