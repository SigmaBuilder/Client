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
import { useTranslation } from "react-i18next";

const getAvailableModules = (t: any) => [
  {
    key: "blog",
    title: t("siteModules.blogTitle"),
    subtitle: t("siteModules.blogSubtitle"),
    description: t("siteModules.blogDesc"),
    icon: Newspaper,
    functions: [
      t("siteModules.blogFn1"),
      t("siteModules.blogFn2"),
      t("siteModules.blogFn3"),
      t("siteModules.blogFn4"),
    ],
  },
  {
    key: "portfolio",
    title: t("siteModules.portfolioTitle"),
    subtitle: t("siteModules.portfolioSubtitle"),
    description: t("siteModules.portfolioDesc"),
    icon: Briefcase,
    functions: [
      t("siteModules.portfolioFn1"),
      t("siteModules.portfolioFn2"),
      t("siteModules.portfolioFn3"),
      t("siteModules.portfolioFn4"),
    ],
  },
];

export default function SiteModulesPage() {
  const { currentSite, isLoading, setCurrentSite } = useWorkspace();
  const [savingModule, setSavingModule] = useState<string | null>(null);
  const { t } = useTranslation();
  const modulesAvailable = useMemo(() => getAvailableModules(t), [t]);

  const modules = currentSite?.features?.modules ?? {};
  const activeCount = modulesAvailable.filter((module) => modules[module.key] === true).length;

  const headerState = useMemo(() => ({
    breadcrumbs: [{ label: t("siteModules.breadcrumb") }],
    actions: (
      <Badge variant="outline">
        {t("siteModules.activeModules", { count: activeCount })}
      </Badge>
    ),
  }), [activeCount, t]);

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
        toast.success(checked ? t("siteModules.toastActivated") : t("siteModules.toastDeactivated"));
      } else {
        toast.error(res.error || t("siteModules.toastErrorUpdate"));
      }
    } catch {
      toast.error(t("siteModules.toastErrorConnect"));
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
          <CardTitle>{t("siteModules.pageTitle")}</CardTitle>
          <CardDescription>
            {t("siteModules.pageDesc")}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {modulesAvailable.map((module) => {
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
                    {checked ? t("siteModules.active") : t("siteModules.inactive")}
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{t("siteModules.includedFunctions")}</p>
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
                    {checked ? t("siteModules.moduleAvailable") : t("siteModules.moduleHidden")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {checked ? t("siteModules.moduleAvailableDesc") : t("siteModules.moduleHiddenDesc")}
                  </p>
                </div>
                <Switch
                  checked={checked}
                  disabled={isSaving}
                  aria-label={checked ? t("siteModules.deactivateLabel", { module: module.title }) : t("siteModules.activateLabel", { module: module.title })}
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
