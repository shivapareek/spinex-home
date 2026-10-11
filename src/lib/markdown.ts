import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Markdown authored by admins in the CMS → HTML. Raw HTML blocks are escaped. */
export function renderMarkdown(md: string) {
  const escaped = (md || "").replace(/<(?=[a-zA-Z/!])/g, "&lt;");
  return marked.parse(escaped, { async: false }) as string;
}
