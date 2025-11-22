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
import {
  saveDocument,
  loadDocument,
  clearDocument,
  listDocuments,
  saveDocumentAs,
  saveDocumentById,
  loadDocumentById,
  deleteDocumentById,
  renameDocumentById,
  type SavedDocMeta,
} from "@/utils/documentStorage";
import { exportToPDF } from "@/utils/exportDocument";
import { createRoot } from "react-dom/client";
import { PrintDocument } from "@/components/PrintDocument";
import { toast } from "sonner";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveStatus } from "@/components/SaveStatus";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [hasSavedDoc, setHasSavedDoc] = useState(false);
  const [docs, setDocs] = useState<SavedDocMeta[]>([]);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");
  const [showOpen, setShowOpen] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [currentDocName, setCurrentDocName] = useState<string | null>(null);
  const [docVersion, setDocVersion] = useState(0);
  const [showRename, setShowRename] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Detecta se há documento salvo no storage ao iniciar
    const existing = loadDocument();
    setHasSavedDoc(!!(existing && existing.length > 0));
    setDocs(listDocuments());

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
      const saved = currentDocId
        ? saveDocumentById(blocks, currentDocId, currentDocName || undefined)
        : saveDocument(blocks);
      setSaving(false);
      if (saved) {
        setDirty(false);
        setLastSavedAt(Date.now());
        setHasSavedDoc(true);
        if (currentDocId) setDocs(listDocuments());
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
    const success = currentDocId
      ? saveDocumentById(blocks, currentDocId, currentDocName || undefined)
      : saveDocument(blocks);
    setSaving(false);
    if (success) {
      setDirty(false);
      setLastSavedAt(Date.now());
      setHasSavedDoc(true);
      if (currentDocId) setDocs(listDocuments());
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
    setShowOpen(true);
  };

  const handleClear = () => {
    setBlocks([]);
    setShowClearDialog(false);
    clearDocument();
    setHasSavedDoc(false);
    toast.success("Documento limpo");
  };

  const handleSaveAsConfirm = () => {
    const name = saveAsName.trim();
    if (!name) {
      toast.error("Dê um nome ao documento");
      return;
    }
    const meta = saveDocumentAs(blocks, name);
    if (meta) {
      toast.success("Documento salvo");
      setShowSaveAs(false);
      setSaveAsName("");
      setHasSavedDoc(true);
      setDocs(listDocuments());
      setCurrentDocId(meta.id);
      setCurrentDocName(meta.name);
      setDocVersion((v) => v + 1);
    } else {
      toast.error("Erro ao salvar documento");
    }
  };

  const handleOpenDocument = (id: string) => {
    const data = loadDocumentById(id);
    if (data && data.length > 0) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      setBlocks(data);
      setShowOpen(false);
      const meta = docs.find((d) => d.id === id) || null;
      setCurrentDocId(id);
      setCurrentDocName(meta ? meta.name : null);
      setDirty(false);
      setLastSavedAt(meta ? meta.updatedAt : Date.now());
      setDocVersion((v) => v + 1);
      toast.success("Documento carregado");
    } else {
      toast.error("Falha ao abrir documento");
    }
  };

  const handleDeleteDocument = (id: string) => {
    const ok = deleteDocumentById(id);
    if (ok) {
      setDocs(listDocuments());
      toast.success("Documento excluído");
    } else {
      toast.error("Erro ao excluir documento");
    }
  };

  const startRenameDocument = (id: string, name: string) => {
    setRenamingId(id);
    setRenameName(name);
    setShowRename(true);
  };

  const handleRenameConfirm = () => {
    const name = renameName.trim();
    if (!renamingId || !name) {
      toast.error(!name ? "Dê um nome ao documento" : "Documento inválido");
      return;
    }
    const ok = renameDocumentById(renamingId, name);
    if (ok) {
      setDocs(listDocuments());
      if (currentDocId === renamingId) setCurrentDocName(name);
      setShowRename(false);
      setRenamingId(null);
      setRenameName("");
      toast.success("Documento renomeado");
    } else {
      toast.error("Erro ao renomear documento");
    }
  };

  const handleExport = async () => {
    {
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
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        key={currentDocId ?? `v-${docVersion}`}
        className="flex h-screen overflow-hidden bg-background"
      >
        <Sidebar onAddBlock={addBlock} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar
            onExport={handleExport}
            onTogglePreview={() => setShowPreview(!showPreview)}
            showPreview={showPreview}
            currentDocName={currentDocName}
          />

          <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6 p-5">
            <div className="flex gap-3">
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setShowSaveAs(true)}
              >
                <Save className="w-4 h-4" />
                Salvar como…
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoad}
                className="gap-2"
                disabled={docs.length === 0}
              >
                <FolderOpen className="w-4 h-4" />
                Abrir…
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
              <DocumentPreview
                key={`${currentDocId ?? "none"}-${docVersion}`}
                blocks={blocks}
              />
            </div>
          ) : (
            <div key={docVersion} className="flex-1 overflow-auto p-8">
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
                        key={`${block.id}-${docVersion}`}
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

        {/* Dialog: Salvar como */}
        <Dialog open={showSaveAs} onOpenChange={setShowSaveAs}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar como</DialogTitle>
              <DialogDescription>
                Dê um nome para salvar este documento no seu navegador.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="doc-name">Nome do documento</Label>
              <Input
                id="doc-name"
                placeholder="Ex.: Trabalho de História"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveAs(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAsConfirm}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Abrir documento */}
        <Dialog open={showOpen} onOpenChange={setShowOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir documento</DialogTitle>
              <DialogDescription>
                Selecione um documento salvo anteriormente para abrir.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-80 overflow-auto">
              {docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum documento salvo.
                </p>
              ) : (
                docs.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div>
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(d.updatedAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenDocument(d.id)}
                      >
                        Abrir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startRenameDocument(d.id, d.name)}
                      >
                        Renomear
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(d.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: Renomear documento */}
        <Dialog open={showRename} onOpenChange={setShowRename}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renomear documento</DialogTitle>
              <DialogDescription>
                Altere o nome do documento selecionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="rename-doc">Novo nome</Label>
              <Input
                id="rename-doc"
                placeholder="Digite o novo nome"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRename(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRenameConfirm}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndContext>
  );
};

export default Index;
