// ═══════════════════════════════════════════════════════════════
//  Prose — a tiny, dependency-free renderer for the Sanctuary's
//  light markdown (**bold**, *italic*, - bullets, paragraphs).
// ═══════════════════════════════════════════════════════════════

import React from "react";

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined) nodes.push(<strong key={`${keyBase}-b${i}`}>{m[2]}</strong>);
    else if (m[3] !== undefined) nodes.push(<em key={`${keyBase}-i${i}`}>{m[3]}</em>);
    else if (m[4] !== undefined) nodes.push(<code key={`${keyBase}-c${i}`} className="mono">{m[4]}</code>);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Prose({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  let bi = 0;

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${bi++}`} style={{ paddingLeft: "1.2rem", margin: "6px 0" }}>
          {bullets.map((b, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{renderInline(b, `li-${bi}-${j}`)}</li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      bullets.push(trimmed.slice(2));
    } else {
      flush();
      if (trimmed === "") {
        blocks.push(<div key={`sp-${idx}`} style={{ height: 8 }} />);
      } else {
        blocks.push(<p key={`p-${idx}`} style={{ margin: "0 0 6px" }}>{renderInline(line, `p-${idx}`)}</p>);
      }
    }
  });
  flush();

  return <>{blocks}</>;
}
