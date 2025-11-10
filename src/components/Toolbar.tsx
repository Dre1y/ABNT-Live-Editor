import { Button } from "@/components/ui/button";
import { FileDown, Eye, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ToolbarProps {
  onExport: (format: "pdf" | "docx") => void;
  onTogglePreview: () => void;
  showPreview: boolean;
}

export const Toolbar = ({
  onExport,
  onTogglePreview,
  showPreview,
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
          {showPreview ? "Visualizando documento" : "Editando documento"}
        </span>
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-2 m-5">
        <DropdownMenu>
          <DropdownMenuContent className="bg-popover z-50">
            <DropdownMenuItem
              onClick={() => onExport("pdf")}
              className="cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar como PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("docx")}
              className="cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar como DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
