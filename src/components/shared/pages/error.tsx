import { useRouteError, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/features/landing/components/Navbar";
import Footer from "@/components/shared/Footer";
import { ServerCrash } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useTranslation } from "react-i18next";

export default function ErrorPage() {
  const error = useRouteError() as any;
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[800px] -z-10"
        style={{
          background: "radial-gradient(ellipse 90% 60% at 50% -10%, oklch(0.546 0.245 262.9 / 22%) 0%, transparent 80%)"
        }}
      ></div>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <ServerCrash className="w-16 h-16 text-destructive" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">500</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground">{t("errorPage.title")}</h2>
            <p className="max-w-md mx-auto text-muted-foreground">
              {t("errorPage.desc")}
            </p>
            {error && error.statusText || error.message ? (
              <div className="mt-4 p-4 bg-muted rounded-md max-w-lg mx-auto text-sm text-left overflow-auto border">
                <p className="font-mono text-muted-foreground">
                  <i>{error.statusText || error.message}</i>
                </p>
              </div>
            ) : null}
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()} size="lg">
              {t("errorPage.btnRetry")}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">{t("errorPage.btnHome")}</Link>
            </Button>
            {isAuthenticated && (
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">{t("errorPage.btnDashboard")}</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
