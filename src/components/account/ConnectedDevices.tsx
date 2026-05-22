import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Smartphone, Monitor, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getSessions, deleteSession } from "@/lib/auth";
import { toast } from "sonner";

interface Session {
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
}

import { useTranslation } from "react-i18next";

export default function ConnectedDevices() {
  const { logoutAll } = useAuth();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

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
      toast.error(t("connectedDevices.toastLoadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await logoutAll();
      toast.success(t("connectedDevices.toastLogoutAllSuccess"));
    } catch (error) {
      toast.error(t("connectedDevices.toastLogoutAllError"));
      setIsLoggingOutAll(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      const res = await deleteSession(sessionId);
      if (res.success) {
        toast.success(t("connectedDevices.toastRevokeSuccess"));
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        toast.error(res.error || t("connectedDevices.toastRevokeError"));
      }
    } catch (error) {
      toast.error(t("connectedDevices.toastRevokeUnexpected"));
    } finally {
      setRevokingSessionId(null);
    }
  };

  const parseUserAgent = (ua: string) => {
    if (!ua) return { type: "desktop", name: t("connectedDevices.unknownDevice"), browser: t("connectedDevices.unknown") };
    
    const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua);
    const type = isMobile ? "smartphone" : "laptop";
    
    let browser = t("connectedDevices.unknownBrowser");
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    
    let os = t("connectedDevices.unknownOs");
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
    if (!dateString) return t("connectedDevices.activeNow");
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
            <CardTitle className="text-xl">{t("connectedDevices.title")}</CardTitle>
            <CardDescription>
              {t("connectedDevices.desc")}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground whitespace-nowrap"
            onClick={handleLogoutAll}
            disabled={isLoggingOutAll || sessions.length === 0}
          >
            {isLoggingOutAll ? t("connectedDevices.loggingOut") : t("connectedDevices.logoutAllBtn")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground animate-pulse">{t("connectedDevices.loading")}</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("connectedDevices.emptyList")}</p>
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
                          {t("connectedDevices.currentSession")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {browser} • IP: {session.ip_address || t("connectedDevices.unknownIp")}
                    </p>
                    {/* Fecha mostrada en pantallas pequeñas */}
                    <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                      {t("connectedDevices.lastActive")} {formatDate(session.last_used_at || session.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">
                      {t("connectedDevices.lastActive")} {formatDate(session.last_used_at || session.created_at)}
                    </p>
                  </div>
                  
                  {/* Solo mostramos el botón de revocar si no es la sesión actual */}
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                      title={t("connectedDevices.revokeTitle")}
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokingSessionId === session.id}
                    >
                      <LogOut className={`h-4 w-4 ${revokingSessionId === session.id ? 'animate-pulse' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
