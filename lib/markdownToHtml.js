import { marked } from 'marked';
import xss from 'xss';

export default async function markdownToHtml(markdown) {
  const result = xss(marked.parse(markdown));
  return result;
}
