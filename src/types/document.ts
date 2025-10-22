export type BlockType = 'title' | 'paragraph' | 'quote' | 'image' | 'list' | 'table' | 'footnote' | 'cover' | 'toc';

export interface TableCell {
  content: string;
}

export interface DocumentBlock {
  id: string;
  type: BlockType;
  content: string;
  level?: number; // For titles (1-5)
  imageUrl?: string;
  alt?: string;
  listItems?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  footnoteNumber?: number;
  coverData?: {
    title: string;
    subtitle?: string;
    author: string;
    institution: string;
    city: string;
    year: string;
  };
}

export interface DocumentData {
  blocks: DocumentBlock[];
  metadata: {
    title: string;
    author: string;
    date: string;
  };
}
