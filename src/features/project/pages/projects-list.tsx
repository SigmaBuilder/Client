import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/use-workspace";
import { WorkspaceProject } from "@/types/project";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

export default function ProjectsList() {
  const { projects, isLoading, fetchProjects, clearWorkspace } = useWorkspace();
  const { t, i18n } = useTranslation();
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
      toast.error(t("dashboard.toastNameRequired"));
      return;
    }
    setCreating(true);
    const res = await api.createProject<{ project: WorkspaceProject["project"] }>({
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
    });
    if (res.success && res.data) {
      toast.success(t("dashboard.toastCreated", { name: res.data.project.name }));
      setCreateOpen(false);
      await fetchProjects();
    } else {
      toast.error(res.error ?? t("dashboard.toastErrorCreate"));
    }
    setCreating(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t("dashboard.projectsTitle")}</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> {t("dashboard.newProjectBtn")}
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
            <h3 className="text-lg font-medium">{t("dashboard.noProjectsTitle")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("dashboard.noProjectsDesc")}
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> {t("dashboard.createProjectBtn")}
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
                  {item.project.description || t("dashboard.noDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.createdAt")}{" "}
                  {new Date(item.project.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES')}
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
            <DialogTitle>{t("dashboard.newProjectModalTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-name">{t("dashboard.nameLabel")}</Label>
              <Input
                id="proj-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={creating}
                placeholder={t("dashboard.namePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-desc">
                {t("dashboard.descLabel")}{" "}
                <span className="text-muted-foreground font-normal">
                  {t("dashboard.optional")}
                </span>
              </Label>
              <Input
                id="proj-desc"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={creating}
                placeholder={t("dashboard.descPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleCreateProject} disabled={creating}>
              {creating && <Loader2 className="size-3.5 animate-spin" />}
              {t("dashboard.createBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
