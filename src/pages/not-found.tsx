import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/shared/Footer";
import { FileQuestion } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
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
            <div className="rounded-full bg-primary/10 p-6">
              <FileQuestion className="w-16 h-16 text-primary" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground">{t("notFound.title")}</h2>
            <p className="max-w-md mx-auto text-muted-foreground">
              {t("notFound.desc")}
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/">{t("notFound.btnHome")}</Link>
            </Button>
            {isAuthenticated && (
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">{t("notFound.btnDashboard")}</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
