import { Button } from '@/components/ui/button';
import { Printer, FileDown, Eye, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ToolbarProps {
  onPrint: () => void;
  onExport: (format: 'pdf' | 'docx') => void;
  onTogglePreview: () => void;
  showPreview: boolean;
}

export const Toolbar = ({ onPrint, onExport, onTogglePreview, showPreview }: ToolbarProps) => {

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <Button
          variant={showPreview ? 'default' : 'outline'}
          size="sm"
          onClick={onTogglePreview}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Modo Edição' : 'Visualizar'}
        </Button>
      </div>

      <div className="flex items-center gap-2 m-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="w-4 h-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover z-50">
            <DropdownMenuItem onClick={() => onExport('pdf')} className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Exportar como PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('docx')} className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Exportar como DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="default"
          size="sm"
          onClick={onPrint}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
      </div>
    </div>
  );
};
