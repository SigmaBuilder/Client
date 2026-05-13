import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function LinkedAccounts() {
  return (
    <Card className="w-full border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Cuentas Vinculadas</CardTitle>
            <CardDescription>
              Conecta otras cuentas para iniciar sesión más rápido.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">En construcción</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 opacity-60 pointer-events-none">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">GitHub</p>
              <p className="text-sm text-muted-foreground">No conectado</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Conectar</Button>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">Google</p>
              <p className="text-sm text-muted-foreground">Conectado (ejemplo)</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Desconectar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
