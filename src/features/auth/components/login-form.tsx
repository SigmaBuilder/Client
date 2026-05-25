import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [isForgotDialogOpen, setIsForgotDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, redirectTo);
    } catch (err: any) {
      toast.error(err.message || t("login.toastErrorLogin"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;

    setForgotPasswordLoading(true);
    try {
      const response = await api.forgotPassword(forgotPasswordEmail);
      if (response.success) {
        toast.success(t("login.toastSuccessRecover"));
        setIsForgotDialogOpen(false);
        setForgotPasswordEmail("");
      } else {
        toast.error(response.error || t("login.toastErrorRecover"));
      }
    } catch (err: any) {
      toast.error(err.message || t("login.toastErrorConnect"));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t("login.title")}</h1>
                <p className="text-balance text-muted-foreground">
                  {t("login.subtitle")}
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">{t("login.email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("login.password")}</FieldLabel>
                  <Dialog open={isForgotDialogOpen} onOpenChange={setIsForgotDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="ml-auto text-sm underline-offset-2 hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        {t("login.forgotPassword")}
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("login.recoverTitle")}</DialogTitle>
                        <DialogDescription>
                          {t("login.recoverDesc")}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 py-4">
                        <Field>
                          <FieldLabel htmlFor="forgot-email">{t("login.email")}</FieldLabel>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="m@example.com"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                            disabled={forgotPasswordLoading}
                          />
                        </Field>
                        <Button type="submit" disabled={forgotPasswordLoading}>
                          {forgotPasswordLoading ? t("login.sending") : t("login.sendLink")}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t("login.loggingIn") : t("login.loginBtn")}
                </Button>
              </Field>
              <FieldDescription className="text-center mt-2">
                {t("login.noAccount")} <Link to={redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup"} className="underline underline-offset-4 hover:text-primary">{t("login.createAccount")}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/login-image.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5] "
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t("login.terms")} <a href="#">{t("login.termsLink")}</a> {t("login.and")} <a href="#">{t("login.privacyLink")}</a>.
      </FieldDescription>
    </div>
  );
}
