import { Button } from "@/components/ui/button";
import { FileDown, Eye } from "lucide-react";

interface ToolbarProps {
  onExport: () => void;
  onTogglePreview: () => void;
  showPreview: boolean;
  currentDocName?: string | null;
}

export const Toolbar = ({
  onExport,
  onTogglePreview,
  showPreview,
  currentDocName,
}: ToolbarProps) => {
  return (
    <div className="h-16 border-b border-border bg-card p-4 flex items-center px-8">
      {/* Lado esquerdo */}
      <div className="flex items-center gap-4">
        <Button
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={onTogglePreview}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Modo Edição" : "Visualizar"}
        </Button>
      </div>

      {/* CENTRO */}
      <div className="flex-1 flex justify-center">
        <span className="text-sm font-medium">
          {showPreview ? "Visualizando" : "Editando"}{" "}
          {currentDocName ? `: ${currentDocName}` : " documento"}
        </span>
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-2 m-5">
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={onExport}
        >
          <FileDown className="w-4 h-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
