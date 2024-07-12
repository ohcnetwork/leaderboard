"use client";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import clsx from "clsx";
import { useEffect, useState } from "react";
export default function DiscussionMarkdown(props: {
  children: string;
  className?: string;
}) {
  const [processedContent, setProcessedContent] = useState("");

  useEffect(() => {
    const processMarkdown = async () => {
      const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(props.children || "");

      setProcessedContent(result.toString());
    };
    processMarkdown();
  }, [props.children]);
  return (
    <div className="prose font-inter text-sm leading-relaxed dark:prose-invert sm:text-base xl:text-left">
      <div
        className={clsx(props.className ?? "")}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
}
