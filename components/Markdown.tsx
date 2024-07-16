import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import clsx from "clsx";
export default async function Markdown(props: {
  children: string;
  className?: string;
}) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(props.children || "");

  return (
    <div className="prose font-inter text-sm leading-relaxed dark:prose-invert prose-h2:mt-3 sm:text-base xl:text-left">
      <div
        className={clsx(props.className ?? "")}
        dangerouslySetInnerHTML={{ __html: result.toString() }}
      />
    </div>
  );
}
