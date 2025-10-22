import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface TableEditorProps {
  headers: string[];
  rows: string[][];
  onChange: (headers: string[], rows: string[][]) => void;
}

export const TableEditor = ({ headers, rows, onChange }: TableEditorProps) => {
  const addColumn = () => {
    const newHeaders = [...headers, `Coluna ${headers.length + 1}`];
    const newRows = rows.map(row => [...row, '']);
    onChange(newHeaders, newRows);
  };

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== index);
    const newRows = rows.map(row => row.filter((_, i) => i !== index));
    onChange(newHeaders, newRows);
  };

  const addRow = () => {
    const newRow = headers.map(() => '');
    onChange(headers, [...rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== index);
    onChange(headers, newRows);
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onChange(newHeaders, rows);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    onChange(headers, newRows);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              {headers.map((header, index) => (
                <th key={index} className="border border-border p-2">
                  <div className="flex gap-1 items-center">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      className="h-8 font-semibold text-center"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeColumn(index)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-border p-2">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="h-8"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addColumn} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Coluna
        </Button>
        <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Linha
        </Button>
        {rows.length > 1 && (
          <Button variant="outline" size="sm" onClick={() => removeRow(rows.length - 1)} className="gap-2">
            <Minus className="w-4 h-4" />
            Remover Linha
          </Button>
        )}
      </div>
    </div>
  );
};
