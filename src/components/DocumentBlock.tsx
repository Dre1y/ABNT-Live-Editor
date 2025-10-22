import { DocumentBlock as DocumentBlockType } from '@/types/document';
import { Trash2, GripVertical, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableEditor } from '@/components/TableEditor';
import { CoverEditor } from '@/components/CoverEditor';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DocumentBlockProps {
  block: DocumentBlockType;
  onUpdate: (id: string, updates: Partial<DocumentBlockType>) => void;
  onDelete: (id: string) => void;
}

export const DocumentBlock = ({ block, onUpdate, onDelete }: DocumentBlockProps) => {
  const [imagePreview, setImagePreview] = useState<string>(block.imageUrl || '');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        onUpdate(block.id, { imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleListItemChange = (index: number, value: string) => {
    const newItems = [...(block.listItems || [])];
    newItems[index] = value;
    onUpdate(block.id, { listItems: newItems });
  };

  const addListItem = () => {
    const newItems = [...(block.listItems || []), ''];
    onUpdate(block.id, { listItems: newItems });
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="group relative bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all"
    >
      <div 
        className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(block.id)}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="pl-6">
        {block.type === 'title' && (
          <div className="space-y-3">
            <Select
              value={block.level?.toString() || '1'}
              onValueChange={(value) => onUpdate(block.id, { level: parseInt(value) })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Nível do título" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Título Nível 1</SelectItem>
                <SelectItem value="2">Título Nível 2</SelectItem>
                <SelectItem value="3">Título Nível 3</SelectItem>
                <SelectItem value="4">Título Nível 4</SelectItem>
                <SelectItem value="5">Título Nível 5</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Digite o título..."
              className="font-document text-lg font-bold"
            />
          </div>
        )}

        {block.type === 'paragraph' && (
          <Textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="Digite o parágrafo..."
            className="min-h-32 font-document resize-none"
          />
        )}

        {block.type === 'quote' && (
          <Textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            placeholder="Digite a citação..."
            className="min-h-24 font-document italic resize-none border-l-4 border-accent"
          />
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt={block.alt} className="max-w-full h-auto mx-auto rounded" />
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Clique para fazer upload de imagem
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <Input
              value={block.alt || ''}
              onChange={(e) => onUpdate(block.id, { alt: e.target.value })}
              placeholder="Descrição da imagem (alt text)..."
              className="text-sm"
            />
          </div>
        )}

        {block.type === 'list' && (
          <div className="space-y-2">
            {(block.listItems || ['']).map((item, index) => (
              <Input
                key={index}
                value={item}
                onChange={(e) => handleListItemChange(index, e.target.value)}
                placeholder={`Item ${index + 1}...`}
                className="font-document"
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addListItem}
              className="w-full"
            >
              + Adicionar item
            </Button>
          </div>
        )}

        {block.type === 'table' && (
          <TableEditor
            headers={block.tableData?.headers || ['Coluna 1', 'Coluna 2']}
            rows={block.tableData?.rows || [['', ''], ['', '']]}
            onChange={(headers, rows) => onUpdate(block.id, { tableData: { headers, rows } })}
          />
        )}

        {block.type === 'footnote' && (
          <div className="space-y-2">
            <Input
              type="number"
              value={block.footnoteNumber || 1}
              onChange={(e) => onUpdate(block.id, { footnoteNumber: parseInt(e.target.value) })}
              placeholder="Número da nota"
              className="w-32"
            />
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="Texto da nota de rodapé..."
              className="min-h-20 font-document text-sm resize-none"
            />
          </div>
        )}

        {block.type === 'cover' && (
          <CoverEditor
            data={block.coverData || {
              title: '',
              author: '',
              institution: '',
              city: '',
              year: new Date().getFullYear().toString(),
            }}
            onChange={(data) => onUpdate(block.id, { coverData: data })}
          />
        )}

        {block.type === 'toc' && (
          <div className="p-4 bg-muted/50 rounded border border-border">
            <p className="text-sm text-muted-foreground italic">
              O sumário será gerado automaticamente com base nos títulos do documento
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
