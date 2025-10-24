import { useEffect, useRef, useState, useMemo } from "react";
import { DocumentBlock } from "@/types/document";

interface DocumentPreviewProps {
  blocks: DocumentBlock[];
}

export const DocumentPreview = ({ blocks }: DocumentPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<DocumentBlock[][]>([]);

  const PAGE_HEIGHT = 29.7 * 37.795; // 29.7cm em pixels

  const tableOfContents = useMemo(() => {
    return blocks
      .filter((block) => block.type === "title")
      .map((block, index) => ({
        id: block.id,
        content: block.content,
        level: block.level || 1,
        page: index + 1,
      }));
  }, [blocks]);

  // Divide os blocos em páginas
  useEffect(() => {
    if (!containerRef.current) return;

    let currentHeight = 0;
    let currentPage: DocumentBlock[] = [];
    const allPages: DocumentBlock[][] = [];

    const estimateBlockHeight = (block: DocumentBlock) => {
      switch (block.type) {
        case "paragraph":
          return ((block.content?.length || 50) / 2) + 20;
        case "title":
          return 40;
        case "image":
          return 200;
        case "list":
        case "ordered-list":
          return ((block.listItems?.length || 3) * 20) + 10;
        case "abstract":
        case "references":
        case "keywords":
          return 80;
        case "table":
          return ((block.tableData?.rows.length || 3) * 30) + 40;
        case "quote":
          return 60;
        case "cover":
          return 500;
        default:
          return 50;
      }
    };

    blocks.forEach((block) => {
      const blockHeight = estimateBlockHeight(block);

      if (currentHeight + blockHeight > PAGE_HEIGHT) {
        allPages.push(currentPage);
        currentPage = [block];
        currentHeight = blockHeight;
      } else {
        currentPage.push(block);
        currentHeight += blockHeight;
      }
    });

    if (currentPage.length > 0) {
      allPages.push(currentPage);
    }

    setPages(allPages);
  }, [blocks]);

  const getTitleClass = (level: number = 1) => {
    const sizes = {
      1: "font-bold text-2xl uppercase text-center",
      2: "font-bold text-xl",
      3: "font-bold text-lg",
      4: "font-bold text-base",
      5: "font-semibold text-base",
    };
    return sizes[level as keyof typeof sizes] || sizes[1];
  };

  // Renderiza cada bloco
  const renderBlock = (block: DocumentBlock) => {
    switch (block.type) {
      case "title":
        return <h2 className={getTitleClass(block.level)} style={{ marginBottom: "1rem", lineHeight: 1.5 }}>{block.content || "Título sem texto"}</h2>;

      case "paragraph":
        return <p style={{ lineHeight: 1.5, textAlign: "justify", textIndent: "1.25cm", fontSize: "12pt", marginBottom: "1rem" }}>{block.content || "Parágrafo vazio"}</p>;

      case "quote":
        return <blockquote style={{ fontStyle: "italic", fontSize: "11pt", lineHeight: 1, paddingLeft: "4cm", borderLeft: "4px solid #888", margin: "1rem 0" }}>{block.content || "Citação vazia"}</blockquote>;

      case "image":
        return (
          <figure style={{ textAlign: "center", margin: "1.5rem 0" }}>
            <img src={block.imageUrl} alt={block.alt || "Imagem do documento"} style={{ maxWidth: "100%", maxHeight: 400 }} />
            {block.alt && <figcaption style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "#666" }}>{block.alt}</figcaption>}
          </figure>
        );

      case "list":
        return <ul style={{ listStyleType: "disc", paddingLeft: "2rem", lineHeight: 1.5, fontSize: "12pt", marginBottom: "1rem" }}>{(block.listItems || []).map((item, i) => <li key={i}>{item || `Item ${i + 1}`}</li>)}</ul>;

      case "ordered-list":
        return <ol style={{ listStyleType: "decimal", paddingLeft: "2rem", lineHeight: 1.5, fontSize: "12pt", marginBottom: "1rem" }}>{(block.listItems || []).map((item, i) => <li key={i}>{item || `Item ${i + 1}`}</li>)}</ol>;

      case "abstract":
        return (
          <div style={{ margin: "2rem 0", pageBreakAfter: "always" }}>
            <h2 style={{ textAlign: "center", textTransform: "uppercase", fontWeight: "bold", marginBottom: "1rem" }}>RESUMO</h2>
            <p style={{ lineHeight: 1.5, fontSize: "12pt" }}>{block.content || "Resumo vazio"}</p>
          </div>
        );

      case "keywords":
        return (
          <div style={{ margin: "1.5rem 0" }}>
            <p style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "12pt" }}>Palavras-chave:</p>
            <p style={{ lineHeight: 1.5, fontSize: "12pt" }}>{(block.keywords || []).join("; ")}.</p>
          </div>
        );

      case "references":
        return (
          <div style={{ margin: "2rem 0", pageBreakBefore: "always" }}>
            <h2 style={{ textAlign: "center", textTransform: "uppercase", fontWeight: "bold", marginBottom: "1.5rem" }}>REFERÊNCIAS</h2>
            {(block.references || []).map((ref, i) => (
              <p key={i} style={{ lineHeight: 1.5, fontSize: "12pt", marginBottom: "0.5rem" }}>{ref || `Referência ${i + 1}`}</p>
            ))}
          </div>
        );

      case "cover":
        return (
          <div style={{ textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4rem 0", pageBreakAfter: "always" }}>
            <div>
              <p style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "2rem" }}>{block.coverData?.institution?.toUpperCase()}</p>
              <p style={{ fontSize: "1rem", marginBottom: "2rem" }}>{block.coverData?.author}</p>
            </div>
            <div style={{ margin: "auto 0" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold", textTransform: "uppercase", marginBottom: "1rem" }}>{block.coverData?.title}</h1>
              {block.coverData?.subtitle && <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>{block.coverData.subtitle}</h2>}
            </div>
            <div>
              <p style={{ fontSize: "1rem" }}>{block.coverData?.city}</p>
              <p style={{ fontSize: "1rem" }}>{block.coverData?.year}</p>
            </div>
          </div>
        );

      case "table":
        return (
          <div style={{ margin: "1.5rem 0", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12pt" }}>
              <thead>
                <tr style={{ backgroundColor: "#eee" }}>
                  {block.tableData?.headers.map((header, i) => (
                    <th key={i} style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "center", fontWeight: "bold" }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableData?.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "footnote":
        return <div style={{ fontSize: "0.75rem", marginTop: "1rem", paddingTop: "0.5rem", borderTop: "1px solid #ccc" }}><sup>{block.footnoteNumber || 1}</sup> {block.content}</div>;

      default:
        return null;
    }
  };

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", backgroundColor: "#f5f5f5", padding: "2rem 0" }} ref={containerRef}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem" }}>
        {pages.map((pageBlocks, index) => (
          <div key={index} style={{ width: "21cm", minHeight: "29.7cm", padding: "3cm 2cm 2cm 3cm", background: "white", boxShadow: "0 0 10px rgba(0,0,0,0.1)", marginBottom: "1rem", boxSizing: "border-box", overflow: "hidden" }}>
            {pageBlocks.map((block) => (
              <div key={block.id}>{renderBlock(block)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
