/** Convert the repository's plain editorial blocks to safe HTML. */
export function renderContent(body: string): string {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('### ')) return `<h3>${escapeHtml(block.slice(4))}</h3>`;
      if (block.startsWith('## ')) return `<h2>${escapeHtml(block.slice(3))}</h2>`;
      if (block.startsWith('# ')) return `<h1>${escapeHtml(block.slice(2))}</h1>`;
      return `<p>${escapeHtml(block)}</p>`;
    })
    .join('');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
