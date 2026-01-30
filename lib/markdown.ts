// Simple markdown parser for task descriptions
// Handles: **bold**, *italic*, `code`, and links

export function parseMarkdown(text: string): string {
  if (!text) return "";
  
  let html = text;
  
  // Escape HTML to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  
  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");
  
  // Inline code: `code`
  html = html.replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">$1</code>');
  
  // Links: [text](url)
  html = html.replace(
    /\[(.+?)\]\((.+?)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:no-underline">$1</a>'
  );
  
  // Line breaks
  html = html.replace(/\n/g, "<br>");
  
  return html;
}
