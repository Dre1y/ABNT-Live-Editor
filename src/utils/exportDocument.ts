import { DocumentBlock } from "@/types/document";
import html2pdf from "html2pdf.js";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  WidthType,
  Packer,
} from "docx";
import { saveAs } from "file-saver";

export const exportToPDF = async (element: HTMLElement) => {
  const opt = {
    margin: [30, 20, 20, 30] as [number, number, number, number], // top, right, bottom, left (in mm)
    filename: "documento-abnt.pdf",
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    pagebreak: { mode: ["css", "legacy"] as any },
    jsPDF: {
      unit: "mm" as const,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return false;
  }
};

export const exportToDOCX = async (blocks: DocumentBlock[]) => {
  const children: any[] = [];

  blocks.forEach((block) => {
    switch (block.type) {
      case "cover":
        if (block.coverData) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: block.coverData.institution.toUpperCase(),
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            ...(() => {
              const authors =
                block.coverData!.authors && block.coverData!.authors!.length > 0
                  ? block.coverData!.authors!
                  : block.coverData!.author
                  ? [block.coverData!.author]
                  : [];
              const sorted = [...authors]
                .filter(Boolean)
                .sort((a, b) =>
                  a.localeCompare(b, "pt-BR", { sensitivity: "base" })
                );
              if (sorted.length === 0) return [] as any[];
              return sorted.map(
                (name, idx) =>
                  new Paragraph({
                    children: [new TextRun({ text: name })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: idx === sorted.length - 1 ? 400 : 0 },
                  })
              );
            })(),
            new Paragraph({
              children: [
                new TextRun({
                  text: block.coverData.title.toUpperCase(),
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 200 },
            })
          );
          if (block.coverData.subtitle) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: block.coverData.subtitle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              })
            );
          }
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${block.coverData.city}\n${block.coverData.year}`,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 400 },
            })
          );
        }
        break;

      case "title":
        const headingLevels = [
          HeadingLevel.HEADING_1,
          HeadingLevel.HEADING_2,
          HeadingLevel.HEADING_3,
          HeadingLevel.HEADING_4,
          HeadingLevel.HEADING_5,
        ];
        children.push(
          new Paragraph({
            text: block.content,
            heading: headingLevels[(block.level || 1) - 1],
            alignment:
              block.level === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 240, after: 120 },
          })
        );
        break;

      case "paragraph":
        children.push(
          new Paragraph({
            text: block.content,
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 1134 }, // 1.25cm in twips
            spacing: { line: 360 }, // 1.5 line spacing
          })
        );
        break;

      case "quote":
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content,
                italics: true,
              }),
            ],
            indent: { left: 1134 * 4 }, // 4cm indent
            spacing: { line: 276 }, // single spacing
          })
        );
        break;

      case "list":
        (block.listItems || []).forEach((item) => {
          children.push(
            new Paragraph({
              text: item,
              bullet: { level: 0 },
              spacing: { line: 360 },
            })
          );
        });
        break;

      case "table":
        if (block.tableData) {
          const tableRows = [
            new TableRow({
              children: block.tableData.headers.map(
                (header) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: header,
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                    width: {
                      size: 100 / block.tableData!.headers.length,
                      type: WidthType.PERCENTAGE,
                    },
                  })
              ),
            }),
            ...block.tableData.rows.map(
              (row) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [new Paragraph(cell)],
                        width: {
                          size: 100 / block.tableData!.headers.length,
                          type: WidthType.PERCENTAGE,
                        },
                      })
                  ),
                })
            ),
          ];

          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
        break;

      case "footnote":
        children.push(
          new Paragraph({
            text: `${block.footnoteNumber || ""} ${block.content}`,
            spacing: { before: 120 },
          })
        );
        break;

      default:
        break;
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134 * 3, // 3cm
              right: 1134 * 2, // 2cm
              bottom: 1134 * 2, // 2cm
              left: 1134 * 3, // 3cm
            },
          },
        },
        children,
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "documento-abnt.docx");
    return true;
  } catch (error) {
    console.error("Error exporting to DOCX:", error);
    return false;
  }
};
