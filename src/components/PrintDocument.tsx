import React, { useMemo } from "react";
import { DocumentBlock } from "@/types/document";

interface PrintDocumentProps {
  blocks: DocumentBlock[];
}

// Print rendering matching the on-screen preview pagination and styles.
export const PrintDocument: React.FC<PrintDocumentProps> = ({ blocks }) => {
  // Same title styles used by the preview component
  const getTitleClass = (level: number = 1) => {
    const sizes: Record<number, React.CSSProperties> = {
      1: {
        fontWeight: "bold",
        fontSize: "20pt",
        textTransform: "uppercase",
        textAlign: "center",
      },
      2: { fontWeight: "bold", fontSize: "16pt" },
      3: { fontWeight: "bold", fontSize: "14pt" },
      4: { fontWeight: "bold", fontSize: "12pt" },
      5: { fontWeight: 600, fontSize: "12pt" },
    };
    return sizes[level] || sizes[1];
  };

  // Mirrors preview's pseudo-pagination logic to produce identical pages
  const PAGE_HEIGHT = 29.7 * 37.795; // 29.7cm in pixels (approx)

  const pages = useMemo(() => {
    let currentHeight = 0;
    let currentPage: DocumentBlock[] = [];
    const allPages: DocumentBlock[][] = [];

    const estimateBlockHeight = (block: DocumentBlock) => {
      switch (block.type) {
        case "paragraph":
          return (block.content?.length || 50) / 2 + 20;
        case "title":
          return 40;
        case "image":
          return Math.max(120, 200 * ((block.imageWidth || 100) / 100));
        case "list":
        case "ordered-list":
          return (block.listItems?.length || 3) * 20 + 10;
        case "abstract":
        case "references":
        case "keywords":
          return 80;
        case "table":
          return (block.tableData?.rows.length || 3) * 30 + 40;
        case "quote":
          return 60;
        case "cover":
          return 500;
        default:
          return 50;
      }
    };

    blocks.forEach((block) => {
      // Explicit page break starts a new page
      if (block.type === "page-break") {
        if (currentPage.length > 0) {
          allPages.push(currentPage);
        } else {
          // preserve intentional blank page
          allPages.push([]);
        }
        currentPage = [];
        currentHeight = 0;
        return;
      }

      // Dedicated standalone pages for cover and TOC
      if (block.type === "cover" || block.type === "toc") {
        if (currentPage.length > 0) {
          allPages.push(currentPage);
        }
        allPages.push([block]);
        currentPage = [];
        currentHeight = 0;
        return;
      }

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

    return allPages;
  }, [blocks]);

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

  const renderBlock = (block: DocumentBlock) => {
    switch (block.type) {
      case "title":
        return (
          <h2
            style={{
              ...getTitleClass(block.level),
              marginBottom: "1rem",
              lineHeight: 1.5,
            }}
          >
            {block.content || "Título sem texto"}
          </h2>
        );

      case "toc":
        return (
          <div style={{ margin: "2rem 0" }}>
            <h2
              style={{
                textAlign: "center",
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              SUMÁRIO
            </h2>
            <ul
              style={{
                listStyle: "none",
                paddingLeft: 0,
                fontSize: "12pt",
                lineHeight: 1.5,
              }}
            >
              {tableOfContents.map((item) => (
                <li
                  key={item.id}
                  style={{
                    marginLeft: `${(item.level - 1) * 1.5}rem`,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{item.content}</span>
                  <span>{item.page}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "paragraph":
        return (
          <p
            style={{
              lineHeight: 1.5,
              textAlign: "justify",
              textIndent: "1.25cm",
              fontSize: "12pt",
              marginBottom: "1rem",
            }}
          >
            {block.content || "Parágrafo vazio"}
          </p>
        );

      case "quote":
        return (
          <blockquote
            style={{
              fontStyle: "italic",
              fontSize: "11pt",
              lineHeight: 1,
              paddingLeft: "4cm",
              borderLeft: "4px solid #888",
              margin: "1rem 0",
            }}
          >
            {block.content || "Citação vazia"}
          </blockquote>
        );

      case "image":
        return (
          <figure style={{ textAlign: "center", margin: "1.5rem 0" }}>
            <img
              src={block.imageUrl}
              alt={block.alt || "Imagem do documento"}
              style={{
                width: `${block.imageWidth || 100}%`,
                height: "auto",
                maxHeight: 600,
              }}
            />
            {block.alt && (
              <figcaption
                style={{
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                  color: "#666",
                }}
              >
                {block.alt}
              </figcaption>
            )}
          </figure>
        );

      case "list":
        return (
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "2rem",
              lineHeight: 1.5,
              fontSize: "12pt",
              marginBottom: "1rem",
            }}
          >
            {(block.listItems || []).map((item, i) => (
              <li key={i}>{item || `Item ${i + 1}`}</li>
            ))}
          </ul>
        );

      case "ordered-list":
        return (
          <ol
            style={{
              listStyleType: "decimal",
              paddingLeft: "2rem",
              lineHeight: 1.5,
              fontSize: "12pt",
              marginBottom: "1rem",
            }}
          >
            {(block.listItems || []).map((item, i) => (
              <li key={i}>{item || `Item ${i + 1}`}</li>
            ))}
          </ol>
        );

      case "abstract":
        return (
          <div style={{ margin: "2rem 0" }}>
            <h2
              style={{
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              RESUMO
            </h2>
            <p style={{ lineHeight: 1.5, fontSize: "12pt" }}>
              {block.content || "Resumo vazio"}
            </p>
          </div>
        );

      case "keywords":
        return (
          <div style={{ margin: "1.5rem 0" }}>
            <p
              style={{
                fontWeight: "bold",
                marginBottom: "0.5rem",
                fontSize: "12pt",
              }}
            >
              Palavras-chave:
            </p>
            <p style={{ lineHeight: 1.5, fontSize: "12pt" }}>
              {(block.keywords || []).join("; ")}.
            </p>
          </div>
        );

      case "references":
        return (
          <div style={{ margin: "2rem 0" }}>
            <h2
              style={{
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              REFERÊNCIAS
            </h2>
            {(block.references || []).map((ref, i) => (
              <p
                key={i}
                style={{
                  lineHeight: 1.5,
                  fontSize: "12pt",
                  marginBottom: "0.5rem",
                }}
              >
                {ref || `Referência ${i + 1}`}
              </p>
            ))}
          </div>
        );

      case "cover":
        return (
          <div
            style={{
              textAlign: "center",
              minHeight: "calc(29.7cm - 5cm)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
            }}
          >
            <div>
              <p
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  marginBottom: "1.25rem",
                }}
              >
                {block.coverData?.institution?.toUpperCase()}
              </p>
              <div style={{ fontSize: "1rem" }}>
                {(() => {
                  const authors =
                    block.coverData?.authors &&
                    block.coverData.authors.length > 0
                      ? block.coverData.authors
                      : block.coverData?.author
                      ? [block.coverData.author]
                      : [];
                  const sorted = [...authors]
                    .filter(Boolean)
                    .sort((a, b) =>
                      a.localeCompare(b, "pt-BR", { sensitivity: "base" })
                    );
                  return sorted.map((name, i) => <div key={i}>{name}</div>);
                })()}
              </div>
            </div>
            <div>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                {block.coverData?.title}
              </h1>
              {block.coverData?.subtitle && (
                <h2 style={{ fontSize: "1.25rem" }}>
                  {block.coverData.subtitle}
                </h2>
              )}
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12pt",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#eee" }}>
                  {block.tableData?.headers.map((header, i) => (
                    <th
                      key={i}
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableData?.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{ border: "1px solid #ccc", padding: "0.5rem" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "footnote":
        return (
          <div
            style={{
              fontSize: "0.75rem",
              marginTop: "1rem",
              paddingTop: "0.5rem",
              borderTop: "1px solid #ccc",
            }}
          >
            <sup>{block.footnoteNumber || 1}</sup> {block.content}
          </div>
        );

      case "page-break":
        // Handled by pagination; no visible block to render
        return null;

      default:
        return null;
    }
  };

  return (
    <div>
      {pages.map((pageBlocks, index) => (
        <div
          key={index}
          style={{
            width: "21cm",
            minHeight: "29.7cm",
            padding: "3cm 2cm 2cm 3cm",
            background: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            marginBottom: "1rem",
            boxSizing: "border-box",
            overflow: "hidden",
            color: "#000",
          }}
        >
          {pageBlocks.map((b) => (
            <div key={b.id}>{renderBlock(b)}</div>
          ))}
        </div>
      ))}
    </div>
  );
};
