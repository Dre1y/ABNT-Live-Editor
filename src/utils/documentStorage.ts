import { DocumentBlock } from "@/types/document";

const STORAGE_KEY = "abnt-document-data"; // compat: documento único
const STORAGE_LIST_KEY = "abnt-document-list"; // índice de múltiplos docs
const STORAGE_DOC_PREFIX = "abnt-document-data:"; // dados do doc: abnt-document-data:{id}

export const saveDocument = (blocks: DocumentBlock[]): boolean => {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    return true;
  } catch (error) {
    console.error("Error saving document:", error);
    return false;
  }
};

export const loadDocument = (): DocumentBlock[] | null => {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading document:", error);
    return null;
  }
};

export const clearDocument = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing document:", error);
    return false;
  }
};

// ====== Múltiplos documentos ======

export interface SavedDocMeta {
  id: string;
  name: string;
  updatedAt: number;
}

const readIndex = (): SavedDocMeta[] => {
  try {
    const raw = localStorage.getItem(STORAGE_LIST_KEY);
    return raw ? (JSON.parse(raw) as SavedDocMeta[]) : [];
  } catch (e) {
    console.error("Error reading documents index:", e);
    return [];
  }
};

const writeIndex = (items: SavedDocMeta[]) => {
  localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(items));
};

export const listDocuments = (): SavedDocMeta[] => {
  if (typeof window === "undefined") return [];
  const items = readIndex();
  // ordena por atualização desc
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const saveDocumentAs = (
  blocks: DocumentBlock[],
  name: string
): SavedDocMeta | null => {
  if (typeof window === "undefined") return null;
  try {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const meta: SavedDocMeta = {
      id,
      name: name.trim() || "Sem título",
      updatedAt: Date.now(),
    };
    localStorage.setItem(`${STORAGE_DOC_PREFIX}${id}`, JSON.stringify(blocks));
    const idx = readIndex();
    idx.push(meta);
    writeIndex(idx);
    return meta;
  } catch (e) {
    console.error("Error saving document as:", e);
    return null;
  }
};

export const saveDocumentById = (
  blocks: DocumentBlock[],
  id: string,
  name?: string
): boolean => {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(`${STORAGE_DOC_PREFIX}${id}`, JSON.stringify(blocks));
    const idx = readIndex();
    const i = idx.findIndex((x) => x.id === id);
    if (i >= 0) {
      idx[i] = { ...idx[i], updatedAt: Date.now(), name: name ?? idx[i].name };
    } else {
      idx.push({ id, name: name || "Sem título", updatedAt: Date.now() });
    }
    writeIndex(idx);
    return true;
  } catch (e) {
    console.error("Error saving document by id:", e);
    return false;
  }
};

export const loadDocumentById = (id: string): DocumentBlock[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_DOC_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as DocumentBlock[]) : null;
  } catch (e) {
    console.error("Error loading document by id:", e);
    return null;
  }
};

export const deleteDocumentById = (id: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem(`${STORAGE_DOC_PREFIX}${id}`);
    const idx = readIndex().filter((x) => x.id !== id);
    writeIndex(idx);
    return true;
  } catch (e) {
    console.error("Error deleting document by id:", e);
    return false;
  }
};

export const renameDocumentById = (id: string, name: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const idx = readIndex();
    const i = idx.findIndex((x) => x.id === id);
    if (i >= 0) {
      idx[i] = {
        ...idx[i],
        name: name.trim() || idx[i].name,
        updatedAt: Date.now(),
      };
      writeIndex(idx);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error renaming document by id:", e);
    return false;
  }
};
