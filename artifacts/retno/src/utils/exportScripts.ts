import jsPDF from "jspdf";

export interface ScriptData {
  id: number;
  hookType: string;
  hook: string;
  body: string;
  cta: string;
  visualCues: string;
  hashtags: string[];
}

function formatScriptAsText(script: ScriptData, index: number): string {
  return [
    `═══════════════════════════════════════`,
    `SCRIPT ${index + 1} — ${script.hookType.toUpperCase()}`,
    `═══════════════════════════════════════`,
    ``,
    `HOOK`,
    script.hook,
    ``,
    `BODY`,
    script.body,
    ``,
    `CALL TO ACTION`,
    script.cta,
    ``,
    `VISUAL CUES`,
    script.visualCues,
    ``,
    `HASHTAGS`,
    script.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" "),
    ``,
  ].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsTXT(scripts: ScriptData[]): void {
  const header = [
    "RETNO — AI VIRAL SCRIPT FACTORY",
    `Generated: ${new Date().toLocaleString()}`,
    `Scripts: ${scripts.length}`,
    ``,
    ``,
  ].join("\n");

  const body = scripts.map((s, i) => formatScriptAsText(s, i)).join("\n\n");
  downloadFile(header + body, "retno-scripts.txt", "text/plain");
}

export function exportAsMD(scripts: ScriptData[]): void {
  const lines: string[] = [
    "# Retno — AI Viral Script Factory",
    ``,
    `> Generated: ${new Date().toLocaleString()}`,
    ``,
    `---`,
    ``,
  ];

  scripts.forEach((script, i) => {
    lines.push(
      `## Script ${i + 1} — ${script.hookType}`,
      ``,
      `### Hook`,
      ``,
      script.hook,
      ``,
      `### Body`,
      ``,
      script.body,
      ``,
      `### Call to Action`,
      ``,
      script.cta,
      ``,
      `### Visual Cues`,
      ``,
      `*${script.visualCues}*`,
      ``,
      `### Hashtags`,
      ``,
      script.hashtags.map((h) => `\`#${h.replace(/^#/, "")}\``).join(" "),
      ``,
      `---`,
      ``,
    );
  });

  downloadFile(lines.join("\n"), "retno-scripts.md", "text/markdown");
}

export function exportAsPDF(scripts: ScriptData[]): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;

  let y = margin;

  function fillPage() {
    doc.setFillColor(2, 4, 10);
    doc.rect(0, 0, pageW, pageH, "F");
  }

  function checkPage(needed: number = 10) {
    if (y + needed > pageH - margin) {
      doc.addPage();
      fillPage();
      y = margin;
    }
  }

  function addText(
    text: string,
    size: number,
    r: number,
    g: number,
    b: number,
    style: "normal" | "bold" | "italic" = "normal",
    maxWidth?: number
  ): number {
    doc.setFontSize(size);
    doc.setTextColor(r, g, b);
    doc.setFont("helvetica", style);
    const lines = doc.splitTextToSize(text, maxWidth ?? contentW) as string[];
    lines.forEach((line: string) => {
      checkPage(size * 0.4);
      doc.text(line, margin, y);
      y += size * 0.4;
    });
    return y;
  }

  // Cover page
  fillPage();

  y = 60;
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(58, 134, 255);
  doc.text("RETNO", margin, y);

  y += 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240);
  doc.text("AI Viral Script Factory", margin, y);

  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  doc.text(`${scripts.length} Scripts`, margin, y + 6);

  // Scripts
  scripts.forEach((script, i) => {
    doc.addPage();
    fillPage();
    y = margin;

    // Script number + hook type header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(58, 134, 255);
    doc.text(`Script ${i + 1}`, margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(99, 102, 241);
    const badgeText = script.hookType.toUpperCase();
    const badgeX = pageW - margin - doc.getTextWidth(badgeText) - 4;
    doc.text(badgeText, badgeX, y);

    y += 8;
    doc.setDrawColor(58, 134, 255);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    const sections: { label: string; content: string; lr: number; lg: number; lb: number; cr: number; cg: number; cb: number; italic?: boolean }[] = [
      { label: "HOOK", content: script.hook, lr: 58, lg: 134, lb: 255, cr: 226, cg: 232, cb: 240 },
      { label: "BODY", content: script.body, lr: 156, lg: 163, lb: 175, cr: 226, cg: 232, cb: 240 },
      { label: "CALL TO ACTION", content: script.cta, lr: 156, lg: 163, lb: 175, cr: 226, cg: 232, cb: 240 },
      { label: "VISUAL CUES", content: script.visualCues, lr: 167, lg: 139, lb: 250, cr: 209, cg: 213, cb: 219, italic: true },
      { label: "HASHTAGS", content: script.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join("  "), lr: 156, lg: 163, lb: 175, cr: 107, cg: 114, cb: 128 },
    ];

    sections.forEach((sec) => {
      checkPage(16);
      addText(sec.label, 7.5, sec.lr, sec.lg, sec.lb, "bold");
      y += 2;
      addText(sec.content, 10, sec.cr, sec.cg, sec.cb, sec.italic ? "italic" : "normal");
      y += 6;
    });
  });

  doc.save("retno-scripts.pdf");
}

export function formatScriptForClipboard(script: ScriptData): string {
  return [
    `Script ${script.id} — ${script.hookType}`,
    ``,
    `HOOK`,
    script.hook,
    ``,
    `BODY`,
    script.body,
    ``,
    `CALL TO ACTION`,
    script.cta,
    ``,
    `VISUAL CUES`,
    script.visualCues,
    ``,
    `HASHTAGS`,
    script.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" "),
  ].join("\n");
}

export function formatAllScriptsForClipboard(scripts: ScriptData[]): string {
  return scripts.map((s, i) => formatScriptAsText(s, i)).join("\n\n");
}
