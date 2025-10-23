import { DocumentBlock } from "@/types/document";
import { useMemo } from "react";

interface DocumentPreviewProps {
  blocks: DocumentBlock[];
}

export const DocumentPreview = ({ blocks }: DocumentPreviewProps) => {
  const getTitleClass = (level: number = 1) => {
    const sizes = {
      1: "text-2xl font-bold uppercase text-center",
      2: "text-xl font-bold",
      3: "text-lg font-bold",
      4: "text-base font-bold",
      5: "text-base font-semibold",
    };
    return sizes[level as keyof typeof sizes] || sizes[1];
  };

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

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div
          className="bg-document-bg shadow-lg rounded-lg"
          style={{
            paddingTop: "3cm",
            paddingBottom: "2cm",
            paddingLeft: "3cm",
            paddingRight: "2cm",
            width: "21cm",
            minHeight: "29.7cm",
          }}
        >
          <div className="space-y-6 font-document text-foreground pb-16">
            {blocks.length === 0 ? (
              <div className="text-center text-muted-foreground py-20">
                <p className="text-lg">Seu documento aparecerá aqui</p>
                <p className="text-sm mt-2">
                  Comece adicionando elementos pela barra lateral
                </p>
              </div>
            ) : (
              blocks.map((block) => (
                <div key={block.id}>
                  {block.type === "cover" && block.coverData && (
                    <div className="text-center h-full flex flex-col justify-between py-16 page-break-after">
                      <div>
                        <p className="font-bold text-lg mb-16">
                          {block.coverData.institution.toUpperCase()}
                        </p>
                        <p className="text-lg mb-32">
                          {block.coverData.author}
                        </p>
                      </div>
                      <div className="my-auto">
                        <h1 className="text-2xl font-bold uppercase mb-4">
                          {block.coverData.title}
                        </h1>
                        {block.coverData.subtitle && (
                          <h2 className="text-xl mb-8">
                            {block.coverData.subtitle}
                          </h2>
                        )}
                      </div>
                      <div>
                        <p className="text-lg">{block.coverData.city}</p>
                        <p className="text-lg">{block.coverData.year}</p>
                      </div>
                    </div>
                  )}

                  {block.type === "toc" && (
                    <div className="page-break-after mb-8">
                      <h2 className="text-2xl font-bold text-center uppercase mb-8">
                        SUMÁRIO
                      </h2>
                      <div className="space-y-2">
                        {tableOfContents.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between"
                            style={{ marginLeft: `${(item.level - 1) * 1}cm` }}
                          >
                            <span>{item.content}</span>
                            <span>{item.page}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === "title" && (
                    <h2
                      className={`${getTitleClass(block.level)} mb-4`}
                      style={{ lineHeight: 1.5 }}
                    >
                      {block.content || "Título sem texto"}
                    </h2>
                  )}

                  {block.type === "paragraph" && (
                    <p
                      className="text-base text-justify"
                      style={{
                        lineHeight: 1.5,
                        textIndent: "1.25cm",
                        fontSize: "12pt",
                      }}
                    >
                      {block.content || "Parágrafo vazio"}
                    </p>
                  )}

                  {block.type === "quote" && (
                    <blockquote
                      className="text-sm italic pl-8 border-l-4 border-accent/50 my-4"
                      style={{
                        lineHeight: 1,
                        fontSize: "11pt",
                        marginLeft: "4cm",
                      }}
                    >
                      {block.content || "Citação vazia"}
                    </blockquote>
                  )}

                  {block.type === "image" && block.imageUrl && (
                    <figure className="my-6 text-center">
                      <img
                        src={block.imageUrl}
                        alt={block.alt || "Imagem do documento"}
                        className="max-w-full h-auto mx-auto"
                        style={{ maxHeight: "400px" }}
                      />
                      {block.alt && (
                        <figcaption className="text-sm mt-2 text-muted-foreground">
                          {block.alt}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {block.type === "list" && (
                    <ul
                      className="list-disc pl-8 space-y-2"
                      style={{ lineHeight: 1.5, fontSize: "12pt" }}
                    >
                      {(block.listItems || []).map((item, index) => (
                        <li key={index}>{item || `Item ${index + 1}`}</li>
                      ))}
                    </ul>
                  )}

                  {block.type === "ordered-list" && (
                    <ol
                      className="list-decimal pl-8 space-y-2"
                      style={{ lineHeight: 1.5, fontSize: "12pt" }}
                    >
                      {(block.listItems || []).map((item, index) => (
                        <li key={index}>{item || `Item ${index + 1}`}</li>
                      ))}
                    </ol>
                  )}

                  {block.type === "abstract" && (
                    <div className="my-8 page-break-after">
                      <h2 className="text-xl font-bold text-center uppercase mb-4">
                        RESUMO
                      </h2>
                      <p
                        className="text-base text-justify"
                        style={{
                          lineHeight: 1.5,
                          fontSize: "12pt",
                        }}
                      >
                        {block.content || "Resumo vazio"}
                      </p>
                    </div>
                  )}

                  {block.type === "keywords" && (
                    <div className="my-6">
                      <p
                        className="font-bold mb-2"
                        style={{ fontSize: "12pt" }}
                      >
                        Palavras-chave:
                      </p>
                      <p
                        className="text-base"
                        style={{ lineHeight: 1.5, fontSize: "12pt" }}
                      >
                        {(block.keywords || []).join("; ")}.
                      </p>
                    </div>
                  )}

                  {block.type === "references" && (
                    <div className="my-8 page-break-before">
                      <h2 className="text-xl font-bold text-center uppercase mb-6">
                        REFERÊNCIAS
                      </h2>
                      <div className="space-y-4">
                        {(block.references || []).map((reference, index) => (
                          <p
                            key={index}
                            className="text-base text-justify"
                            style={{
                              lineHeight: 1.5,
                              fontSize: "12pt",
                            }}
                          >
                            {reference || `Referência ${index + 1}`}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {block.type === "page-break" && (
                    <div className="page-break-after h-0"></div>
                  )}

                  {block.type === "table" && block.tableData && (
                    <div className="my-6 overflow-x-auto">
                      <table className="w-full border-collapse border border-foreground/20 text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            {block.tableData.headers.map((header, index) => (
                              <th
                                key={index}
                                className="border border-foreground/20 p-2 font-bold text-center"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="border border-foreground/20 p-2"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {block.type === "footnote" && (
                    <div className="text-xs mt-4 pt-2 border-t border-foreground/20">
                      <sup>{block.footnoteNumber || 1}</sup> {block.content}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
