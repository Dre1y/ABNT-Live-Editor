import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoverEditorProps {
  data: {
    title: string;
    subtitle?: string;
    authors: string[];
    institution: string;
    city: string;
    year: string;
  };
  onChange: (data: any) => void;
}

// Componente visual para marcar campo obrigatório
const Required = () => <span className="text-red-500 ml-1">*</span>;

export const CoverEditor = ({ data, onChange }: CoverEditorProps) => {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleAuthorChange = (index: number, value: string) => {
    const updated = [...(data.authors || [""])];
    updated[index] = value;
    onChange({ ...data, authors: updated });
  };

  const addAuthor = () => {
    const updated = [...(data.authors || [])];
    updated.push("");
    onChange({ ...data, authors: updated });
  };

  const removeAuthor = (index: number) => {
    const updated = [...(data.authors || [])];
    updated.splice(index, 1);
    if (updated.length === 0) updated.push("");
    onChange({ ...data, authors: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">
          Título do Trabalho
          <Required />
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Digite o título..."
          className="font-semibold"
          required
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtítulo (Opcional)</Label>
        <Input
          id="subtitle"
          value={data.subtitle || ""}
          onChange={(e) => handleChange("subtitle", e.target.value)}
          placeholder="Digite o subtítulo..."
        />
      </div>

      <div>
        <Label>
          Autores
          <Required />
        </Label>
        <div className="space-y-2 mt-1">
          {(data.authors || [""]).map((author, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={author}
                onChange={(e) => handleAuthorChange(idx, e.target.value)}
                placeholder={`Autor(a) ${idx + 1}...`}
                required
                className="flex-1"
              />
              {(data.authors?.length || 0) > 1 && (
                <button
                  type="button"
                  className="px-3 py-2 text-sm border rounded hover:bg-muted"
                  onClick={() => removeAuthor(idx)}
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="w-full px-3 py-2 text-sm border rounded hover:bg-muted"
            onClick={addAuthor}
          >
            + Adicionar autor(a)
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="institution">
          Instituição
          <Required />
        </Label>
        <Input
          id="institution"
          value={data.institution}
          onChange={(e) => handleChange("institution", e.target.value)}
          placeholder="Nome da universidade/instituição..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">
            Cidade
            <Required />
          </Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Cidade..."
            required
          />
        </div>

        <div>
          <Label htmlFor="year">
            Ano
            <Required />
          </Label>
          <Input
            id="year"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={data.year}
            onChange={(e) =>
              handleChange(
                "year",
                e.target.value.replace(/\D/g, "").slice(0, 4)
              )
            }
            placeholder="2025..."
            required
          />
        </div>
      </div>
    </div>
  );
};
