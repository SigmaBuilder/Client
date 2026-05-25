import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

export function InvitePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const res = await api.getInvitation(token);
        if (res.success && res.data) {
          setInvitationData(res.data);
        } else {
          setError(res.error || t("invite.invalidTitle"));
        }
      } catch (err: any) {
        setError(err.message || t("invite.toastErrorConnect"));
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("invite.missingTokenTitle")}</AlertTitle>
            <AlertDescription>
              {t("invite.missingTokenDesc")}
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link to="/dashboard">{t("invite.btnGoToDashboard")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("invite.invalidTitle")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link to="/dashboard">{t("invite.btnGoToDashboard")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await api.acceptInvitation(token);
      if (res.success) {
        toast.success(t("invite.toastSuccessJoin"));
        navigate("/dashboard");
      } else {
        toast.error(res.error || t("invite.toastErrorAccept"));
      }
    } catch (err: any) {
      toast.error(err.message || t("invite.toastErrorConnect"));
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = () => {
    // Optionally delete invitation or just navigate away
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl font-bold text-primary">
              {invitationData?.invitation?.projectName?.charAt(0)?.toUpperCase() || "P"}
            </span>
          </div>
          <CardTitle className="text-xl">{t("invite.projectInvite")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            <strong className="text-foreground">
              {invitationData?.invitation?.inviterName}
            </strong>{" "}
            {t("invite.invitedBy")}{" "}
            <strong className="text-foreground">
              {invitationData?.invitation?.projectName}
            </strong>
            .
          </p>
          {invitationData?.invitation?.roleName && (
            <Badge variant="secondary" className="px-3 py-1">
              {t("invite.role")} {invitationData?.invitation?.roleName}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full"
          >
            {accepting ? t("invite.btnAccepting") : t("invite.btnAccept")}
          </Button>
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={accepting}
            className="w-full"
          >
            {t("invite.btnReject")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
