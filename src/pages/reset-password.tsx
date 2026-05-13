import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              El enlace para restablecer la contraseña no es válido o está incompleto.
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link to="/login">Volver a Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.resetPassword(token, password);
      if (response.success) {
        toast.success("Contraseña actualizada exitosamente.");
        navigate("/login");
      } else {
        toast.error(response.error || "El enlace es inválido o ha expirado.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-muted/50">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Restablecer Contraseña</h1>
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu nueva contraseña a continuación.
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="password">Nueva Contraseña</FieldLabel>
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
                  <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Field>
                <Button type="submit" disabled={loading} className="w-full mt-4">
                  {loading ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
