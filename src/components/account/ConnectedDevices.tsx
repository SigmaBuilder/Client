import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getSessions } from "@/lib/auth";
import { toast } from "sonner";

interface Session {
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
}

export default function ConnectedDevices() {
  const { logoutAll } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await getSessions();
      if (res.success && res.data?.sessions) {
        // Usamos last_used_at o created_at como fallback para ordenar las más recientes arriba
        const sortedSessions = res.data.sessions.sort((a, b) => {
          const timeA = new Date(a.last_used_at || a.created_at).getTime();
          const timeB = new Date(b.last_used_at || b.created_at).getTime();
          return timeB - timeA;
        });
        setSessions(sortedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Error al cargar los dispositivos conectados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await logoutAll();
      toast.success("Se ha cerrado sesión en todos los dispositivos");
    } catch (error) {
      toast.error("Error al cerrar todas las sesiones");
      setIsLoggingOutAll(false);
    }
  };

  const parseUserAgent = (ua: string) => {
    if (!ua) return { type: "desktop", name: "Dispositivo desconocido", browser: "Desconocido" };
    
    const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua);
    const type = isMobile ? "smartphone" : "laptop";
    
    let browser = "Navegador Desconocido";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    
    let os = "OS Desconocido";
    if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";

    return {
      type,
      name: `${os} Device`,
      browser: `${browser} en ${os}`
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Activo ahora";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">Dispositivos Conectados</CardTitle>
            <CardDescription>
              Tus sesiones activas. Cierra sesión en todos los dispositivos si notas actividad sospechosa.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground whitespace-nowrap"
            onClick={handleLogoutAll}
            disabled={isLoggingOutAll || sessions.length === 0}
          >
            {isLoggingOutAll ? "Cerrando..." : "Cerrar todas las sesiones"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Cargando dispositivos...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay sesiones activas encontradas.</p>
        ) : (
          sessions.map((session, index) => {
            const { type, name, browser } = parseUserAgent(session.user_agent);
            const isCurrent = index === 0;

            return (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-background border shadow-sm rounded-full">
                    {getDeviceIcon(type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium leading-none">{name}</p>
                      {isCurrent && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {browser} • IP: {session.ip_address || "Desconocida"}
                    </p>
                    {/* Fecha mostrada en pantallas pequeñas */}
                    <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                      Última vez activo: {formatDate(session.last_used_at || session.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">
                      Última vez activo: {formatDate(session.last_used_at || session.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
