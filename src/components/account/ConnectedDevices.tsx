import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ConnectedDevices() {
  // Datos mock para el frontend por ahora
  const devices = [
    {
      id: 1,
      type: "laptop",
      name: "MacBook Pro",
      browser: "Chrome en macOS",
      location: "Madrid, España",
      date: "Activo ahora",
      current: true,
    },
    {
      id: 2,
      type: "smartphone",
      name: "iPhone 13",
      browser: "Safari en iOS",
      location: "Madrid, España",
      date: "Hace 2 horas",
      current: false,
    },
    {
      id: 3,
      type: "desktop",
      name: "Windows PC",
      browser: "Firefox en Windows",
      location: "Barcelona, España",
      date: "Ayer",
      current: false,
    }
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "laptop": return <Laptop className="h-5 w-5 text-muted-foreground" />;
      case "smartphone": return <Smartphone className="h-5 w-5 text-muted-foreground" />;
      default: return <Monitor className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Dispositivos Conectados</CardTitle>
            <CardDescription>
              Sesiones activas en tus dispositivos. Puedes cerrar sesión en los que no reconozcas.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">En construcción</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-full">
                {getDeviceIcon(device.type)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium leading-none">{device.name}</p>
                  {device.current && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      Actual
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {device.browser} • {device.location}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">{device.date}</p>
              {!device.current && (
                <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  Cerrar sesión
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
