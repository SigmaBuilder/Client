import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || undefined;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("signup.toastPasswordMismatch"));
      return;
    }

    setLoading(true);

    try {
      await register(email, password, firstName, lastName, redirectTo);
    } catch (err: any) {
      toast.error(err.message || t("signup.toastErrorCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t("signup.title")}</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  {t("signup.subtitle")}
                </p>
              </div>
              <Field className="grid md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">{t("signup.firstName")}</FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">{t("signup.lastName")}</FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">{t("signup.email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <FieldDescription>
                  {t("signup.emailDescription")}
                </FieldDescription>
              </Field>
              <Field>
                <Field className="grid md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">{t("signup.password")}</FieldLabel>
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
                    <FieldLabel htmlFor="confirm-password">
                      {t("signup.confirmPassword")}
                    </FieldLabel>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      disabled={loading}
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  {t("signup.passwordDescription")}
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t("signup.btnCreating") : t("signup.btnCreate")}
                </Button>
              </Field>

              <FieldDescription className="text-center mt-2">
                {t("signup.alreadyHaveAccount")} <Link to={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"} className="underline underline-offset-4 hover:text-primary">{t("signup.login")}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/login-image.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5]"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
                {t("signup.terms")}{" "}
                <a href="#">{t("signup.termsOfService")}</a> {t("signup.and")}{" "}
                <a href="#">{t("signup.privacyPolicy")}</a>
      </FieldDescription>
    </div>
  );
}
