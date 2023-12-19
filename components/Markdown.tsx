import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export default async function Markdown(props: { content: string }) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(props.content || "");

  return (
    <div
      className="prose dark:prose-invert xl:text-left leading-relaxed"
      dangerouslySetInnerHTML={{ __html: result.toString() }}
    />
  );
}
