import React from "react";
import { DocumentBlock } from "@/types/document";

interface PrintDocumentProps {
  blocks: DocumentBlock[];
}

// Print-focused rendering without preview pagination.
export const PrintDocument: React.FC<PrintDocumentProps> = ({ blocks }) => {
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
              {/* Nota: A numeração de páginas dinâmica na impressão real é complexa.
                  Exibimos os títulos sem páginas aqui. */}
              {blocks
                .filter((b) => b.type === "title")
                .map((b) => (
                  <li
                    key={b.id}
                    style={{ marginLeft: `${((b.level || 1) - 1) * 1.5}rem` }}
                  >
                    <span>{b.content}</span>
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
                maxHeight: 1200,
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
          <div style={{ margin: "2rem 0", pageBreakAfter: "always" }}>
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
          <div style={{ margin: "2rem 0", pageBreakBefore: "always" }}>
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
              pageBreakAfter: "always",
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
        return <div style={{ pageBreakBefore: "always" }} />;

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: "21cm",
        padding: "3cm 2cm 2cm 3cm",
        background: "white",
        boxSizing: "border-box",
        color: "#000",
      }}
    >
      {blocks.map((b) => (
        <div key={b.id}>{renderBlock(b)}</div>
      ))}
    </div>
  );
};
