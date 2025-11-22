import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DocumentBlock } from "@/components/DocumentBlock";
import { DocumentPreview } from "@/components/DocumentPreview";
import { Toolbar } from "@/components/Toolbar";
import {
  DocumentBlock as DocumentBlockType,
  BlockType,
} from "@/types/document";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { saveDocument, loadDocument } from "@/utils/documentStorage";
import { exportToPDF, exportToDOCX } from "@/utils/exportDocument";
import { createRoot } from "react-dom/client";
import { PrintDocument } from "@/components/PrintDocument";
import { toast } from "sonner";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveStatus } from "@/components/SaveStatus";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const BLOCK_LABELS: Record<BlockType, string> = {
    cover: "Capa",
    title: "Título",
    paragraph: "Parágrafo",
    abstract: "Resumo",
    keywords: "Palavras-chave",
    references: "Referências",
    list: "Lista",
    "ordered-list": "Lista numerada",
    image: "Imagem",
    quote: "Citação",
    table: "Tabela",
    footnote: "Nota de rodapé",
    toc: "Sumário",
    "page-break": "Quebra de página",
  };

  const [blocks, setBlocks] = useState<DocumentBlockType[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const justSavedTimerRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleLoadDocument = () => {
      const savedBlocks = loadDocument();
      if (savedBlocks && savedBlocks.length > 0) {
        setBlocks(savedBlocks);
        toast.success("Documento carregado com sucesso!");
      } else {
        toast.error("Nenhum documento salvo encontrado");
      }
    };

    window.addEventListener("loadDocument", handleLoadDocument);
    return () => window.removeEventListener("loadDocument", handleLoadDocument);
  }, []);

  // Debounced auto-save whenever there are unsaved changes
  useEffect(() => {
    if (!dirty) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setSaving(true);
    // Save 1s after the last change
    saveTimerRef.current = window.setTimeout(() => {
      const saved = saveDocument(blocks);
      setSaving(false);
      if (saved) {
        setDirty(false);
        setLastSavedAt(Date.now());
      } else {
        toast.error("Erro ao salvar automaticamente");
      }
    }, 1000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [blocks, dirty]);

  const addBlock = (type: BlockType) => {
    const UNIQUE_BLOCKS: BlockType[] = ["cover", "abstract", "toc"];

    if (UNIQUE_BLOCKS.includes(type)) {
      const exists = blocks.some((block) => block.type === type);
      if (exists) {
        toast.error("Este elemento só pode ser adicionado uma vez.");
        return;
      }
    }

    const newBlock: DocumentBlockType = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      content: "",
      level: type === "title" ? 1 : undefined,
      imageWidth: type === "image" ? 100 : undefined,
      listItems: type === "list" || type === "ordered-list" ? [""] : undefined,
      keywords: type === "keywords" ? [""] : undefined,
      references: type === "references" ? [""] : undefined,
      tableData:
        type === "table"
          ? {
              headers: ["Coluna 1", "Coluna 2"],
              rows: [
                ["", ""],
                ["", ""],
              ],
            }
          : undefined,
      coverData:
        type === "cover"
          ? {
              title: "",
              authors: [""],
              institution: "",
              city: "",
              year: new Date().getFullYear().toString(),
            }
          : undefined,
    };
    setBlocks([...blocks, newBlock]);
    setDirty(true);
    toast.success(`${BLOCK_LABELS[type]} adicionada(o)!`);
  };

  const updateBlock = (id: string, updates: Partial<DocumentBlockType>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
    setDirty(true);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    setDirty(true);
    toast.success("Elemento removido");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setDirty(true);
      toast.success("Ordem alterada");
    }
  };

  const handleSave = () => {
    const success = saveNow();
    toast[success ? "success" : "error"](
      success ? "Documento salvo!" : "Erro ao salvar"
    );
  };

  const saveNow = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setSaving(true);
    const success = saveDocument(blocks);
    setSaving(false);
    if (success) {
      setDirty(false);
      setLastSavedAt(Date.now());
      // Ativa feedback visual curto para salvamento manual
      if (justSavedTimerRef.current) {
        clearTimeout(justSavedTimerRef.current);
        justSavedTimerRef.current = null;
      }
      setJustSaved(true);
      justSavedTimerRef.current = window.setTimeout(() => {
        setJustSaved(false);
        justSavedTimerRef.current = null;
      }, 2000);
    }
    return success;
  };

  const handleLoad = () => {
    const savedBlocks = loadDocument();
    if (savedBlocks && savedBlocks.length > 0) {
      setBlocks(savedBlocks);
      toast.success("Documento carregado com sucesso!");
    } else {
      toast.error("Nenhum documento salvo encontrado");
    }
  };

  const handleClear = () => {
    setBlocks([]);
    setShowClearDialog(false);
    toast.success("Documento limpo");
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (format === "pdf") {
      // Renderiza uma versão dedicada para impressão/exportação
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "0";
      container.style.top = "0";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      container.style.backgroundColor = "#ffffff";
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(<PrintDocument blocks={blocks} />);

      // Aguarda primeiro paint e imagens
      const waitForImages = async () => {
        const imgs = Array.from(container.querySelectorAll("img"));
        await Promise.all(
          imgs.map(
            (img) =>
              new Promise<void>((resolve) => {
                const el = img as HTMLImageElement;
                if (el.complete) return resolve();
                el.addEventListener("load", () => resolve(), { once: true });
                el.addEventListener("error", () => resolve(), { once: true });
              })
          )
        );
      };

      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await waitForImages();

      const target = (container.firstElementChild as HTMLElement) || container;
      const success = await exportToPDF(target);

      root.unmount();
      container.remove();

      if (success) {
        toast.success("PDF exportado com sucesso!");
      } else {
        toast.error("Erro ao exportar PDF");
      }
    } else if (format === "docx") {
      const success = await exportToDOCX(blocks);
      if (success) {
        toast.success("DOCX exportado com sucesso!");
      } else {
        toast.error("Erro ao exportar DOCX");
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar onAddBlock={addBlock} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar
            onExport={handleExport}
            onTogglePreview={() => setShowPreview(!showPreview)}
            showPreview={showPreview}
          />

          <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6 p-5">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoad}
                className="gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Carregar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </Button>
            </div>
          </div>

          {showPreview ? (
            <div ref={previewRef}>
              <DocumentPreview blocks={blocks} />
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Construa seu Documento
                  </h2>
                  <p className="text-muted-foreground">
                    Adicione e organize os elementos do seu trabalho acadêmico
                    (arraste para reordenar)
                  </p>
                </div>

                {blocks.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-border rounded-lg animate-fade-in">
                    <p className="text-lg text-muted-foreground">
                      Nenhum elemento adicionado ainda
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use a barra lateral para começar a construir seu documento
                    </p>
                  </div>
                ) : (
                  <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {blocks.map((block) => (
                      <DocumentBlock
                        key={block.id}
                        block={block}
                        onUpdate={updateBlock}
                        onDelete={deleteBlock}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            </div>
          )}
        </div>

        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar Documento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja limpar o documento? Esta ação não pode
                ser desfeita e todos os elementos serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClear}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Limpar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <SaveStatus
          saving={saving}
          dirty={dirty}
          lastSavedAt={lastSavedAt}
          onSaveNow={saveNow}
          justSaved={justSaved}
        />
      </div>
    </DndContext>
  );
};

export default Index;
