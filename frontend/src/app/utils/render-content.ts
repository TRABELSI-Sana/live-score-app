/** Convert the repository's plain editorial blocks to safe HTML. */
export function renderContent(body: string): string {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('### ')) return `<h3>${inlineFormat(block.slice(4))}</h3>`;
      if (block.startsWith('## ')) return `<h2>${inlineFormat(block.slice(3))}</h2>`;
      if (block.startsWith('# ')) return `<h1>${inlineFormat(block.slice(2))}</h1>`;

      const lines = block.split('\n');
      if (lines.every((l) => /^- /.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inlineFormat(l.slice(2))}</li>`).join('')}</ul>`;
      }
      if (lines.every((l) => /^\d+[.)]\s/.test(l))) {
        return `<ol>${lines.map((l) => `<li>${inlineFormat(l.replace(/^\d+[.)]\s/, ''))}</li>`).join('')}</ol>`;
      }

      return `<p>${inlineFormat(block)}</p>`;
    })
    .join('');
}

function inlineFormat(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
