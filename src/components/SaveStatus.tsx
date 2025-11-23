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
        <div className="flex items-center gap-1.5 text-amber-600 text-xs">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="font-medium">Salvando…</span>
        </div>
      );
    }
    if (dirty) {
      return (
        <div className="flex items-center gap-1.5 text-amber-600 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span className="font-medium">Alterações não salvas</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
        <CheckCircle2 className="h-3 w-3" />
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
    <div
      className="fixed bottom-24 right-8 z-30 pointer-events-none max-w-[calc(100vw-2rem)]"
      role="status"
    >
      <Card
        className={`min-w-[200px] w-fit shadow-md border-primary/30 pointer-events-auto ${
          justSaved ? "ring-2 ring-emerald-400 animate-pulse" : ""
        }`}
        aria-live="polite"
      >
        <CardContent className="p-2">
          <div className="flex items-center justify-between gap-2">
            {renderStatus()}
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveNow}
              className="gap-1 h-8 px-2 text-xs whitespace-nowrap"
            >
              <Save className="h-3 w-3" />
              Salvar agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
