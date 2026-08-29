export type ChecklistItem = {
  checked: boolean;
  text: string;
  raw: string;
  lineIndex: number;
};

const CHECK_RE = /^(\s*-\s*)\[([ xX])\]\s*(.*)$/;

export function parseChecklist(body: string): ChecklistItem[] {
  const lines = body.split('\n');
  const out: ChecklistItem[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const m = CHECK_RE.exec(line);
    if (m) {
      out.push({ checked: m[2]!.toLowerCase() === 'x', text: m[3] ?? '', raw: line, lineIndex: i });
    }
  }
  return out;
}

export function toggleChecklistLine(body: string, lineIndex: number): string {
  const lines = body.split('\n');
  const line = lines[lineIndex] ?? '';
  const m = CHECK_RE.exec(line);
  if (!m) return body;
  const prefix = m[1] ?? '- [ ] ';
  const checked = m[2]!.toLowerCase() === 'x';
  const text = m[3] ?? '';
  const nextMark = checked ? ' ' : 'x';
  lines[lineIndex] = `${prefix}[${nextMark}] ${text}`;
  return lines.join('\n');
}

export function checklistProgress(body: string): { total: number; done: number } {
  const items = parseChecklist(body);
  const total = items.length;
  const done = items.filter((x) => x.checked).length;
  return { total, done };
}
