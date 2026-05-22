import { FileQuestion, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function DashboardNotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] w-full text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-6 flex items-center justify-center ring-1 ring-border shadow-sm">
        <FileQuestion className="size-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-3">{t("dashboardNotFound.title")}</h1>
      <p className="text-muted-foreground max-w-[400px] mb-8">
        {t("dashboardNotFound.desc")}
      </p>
      <Button asChild>
        <Link to="/dashboard">
          <Home className="mr-2 size-4" />
          {t("dashboardNotFound.backBtn")}
        </Link>
      </Button>
    </div>
  );
}
