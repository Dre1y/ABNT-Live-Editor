import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Loader2, Save } from "lucide-react";

interface SaveStatusProps {
  saving: boolean;
  dirty: boolean;
  lastSavedAt: number | null;
  onSaveNow: () => void;
  justSaved?: boolean; // indica salvamento manual recente
}

export const SaveStatus = ({
  saving,
  dirty,
  lastSavedAt,
  onSaveNow,
  justSaved = false,
}: SaveStatusProps) => {
  const renderStatus = () => {
    if (saving) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-medium">Salvando…</span>
        </div>
      );
    }
    if (dirty) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Alterações não salvas</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">
          {justSaved
            ? "Salvo agora!"
            : lastSavedAt
            ? `Salvo às ${new Date(lastSavedAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Salvamento automático ativado"}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card
        className={`min-w-[280px] shadow-lg border-primary/30 ${
          justSaved ? "ring-2 ring-emerald-400 animate-pulse" : ""
        }`}
        aria-live="polite"
      >
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-3">
            {renderStatus()}
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveNow}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
