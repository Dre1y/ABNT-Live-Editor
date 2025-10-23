import { FileText, Type, Quote, Image, List, ListOrdered, Table, FileSignature, Book, BookOpen, FileX, FileKey, Library, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockType } from '@/types/document';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onAddBlock: (type: BlockType) => void;
}

const blockTypes = [
  { type: 'cover' as BlockType, icon: Book, label: 'Capa' },
  { type: 'toc' as BlockType, icon: BookOpen, label: 'Sumário' },
  { type: 'abstract' as BlockType, icon: FileText, label: 'Resumo' },
  { type: 'keywords' as BlockType, icon: FileKey, label: 'Palavras-chave' },
  { type: 'title' as BlockType, icon: Type, label: 'Título' },
  { type: 'paragraph' as BlockType, icon: FileText, label: 'Parágrafo' },
  { type: 'quote' as BlockType, icon: Quote, label: 'Citação' },
  { type: 'image' as BlockType, icon: Image, label: 'Imagem' },
  { type: 'list' as BlockType, icon: List, label: 'Lista Não Ordenada' },
  { type: 'ordered-list' as BlockType, icon: ListOrdered, label: 'Lista Ordenada' },
  { type: 'table' as BlockType, icon: Table, label: 'Tabela' },
  { type: 'references' as BlockType, icon: Library, label: 'Referências' },
  { type: 'footnote' as BlockType, icon: FileSignature, label: 'Nota de Rodapé' },
  { type: 'page-break' as BlockType, icon: FileX, label: 'Quebra de Página' },
];

export const Sidebar = ({ onAddBlock }: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border h-screen flex flex-col p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            ABNT Doc Editor
          </h1>
          <ThemeToggle />
        </div>
        <p className="text-sm text-muted-foreground">
          Editor de documentos acadêmicos
        </p>
      </div>

      <Button
        variant="outline"
        className="w-full justify-start gap-2 mb-4"
        onClick={() => navigate('/')}
      >
        <Home className="w-4 h-4" />
        Voltar ao Início
      </Button>

      <div className="space-y-2 flex-1 overflow-y-auto">
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
          Adicionar Elementos
        </h2>
        {blockTypes.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3 px-4 hover:bg-secondary transition-all"
            onClick={() => onAddBlock(type)}
          >
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </Button>
        ))}
      </div>

      <div className="pt-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          Formatação automática segundo normas ABNT
        </p>
      </div>
    </div>
  );
};
