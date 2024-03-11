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
    <div
      className={clsx(
        `prose font-inter leading-relaxed dark:prose-invert xl:text-left`,
        props.className ? props.className : "text-sm sm:text-base",
      )}
      dangerouslySetInnerHTML={{ __html: result.toString() }}
    />
  );
}
