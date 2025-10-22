import { DocumentBlock } from '@/types/document';

const STORAGE_KEY = 'abnt-document-data';

export const saveDocument = (blocks: DocumentBlock[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    return false;
  }
};

export const loadDocument = (): DocumentBlock[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading document:', error);
    return null;
  }
};

export const clearDocument = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing document:', error);
    return false;
  }
};
