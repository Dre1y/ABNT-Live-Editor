import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CoverEditorProps {
  data: {
    title: string;
    subtitle?: string;
    author: string;
    institution: string;
    city: string;
    year: string;
  };
  onChange: (data: any) => void;
}

export const CoverEditor = ({ data, onChange }: CoverEditorProps) => {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título do Trabalho</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Digite o título..."
          className="font-semibold"
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
        <Input
          id="subtitle"
          value={data.subtitle || ''}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="Digite o subtítulo..."
        />
      </div>

      <div>
        <Label htmlFor="author">Autor(a)</Label>
        <Input
          id="author"
          value={data.author}
          onChange={(e) => handleChange('author', e.target.value)}
          placeholder="Seu nome completo..."
        />
      </div>

      <div>
        <Label htmlFor="institution">Instituição</Label>
        <Input
          id="institution"
          value={data.institution}
          onChange={(e) => handleChange('institution', e.target.value)}
          placeholder="Nome da universidade/instituição..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Cidade..."
          />
        </div>

        <div>
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            value={data.year}
            onChange={(e) => handleChange('year', e.target.value)}
            placeholder="2025..."
          />
        </div>
      </div>
    </div>
  );
};
