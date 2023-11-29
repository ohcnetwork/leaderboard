"use client";

import { useEffect, useState } from "react";

interface Props {
  mode: "markdown" | "gfm";
  text: string;
  context: string;
}

export default function Markdown(props: Props) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!props.text) return;

    fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        // Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        mode: props.mode,
        text: props.text,
        context: props.context,
      }),
    })
      .then((res) => res.text())
      .then((data) => setHtml(data));
  }, [props.mode, props.text, props.context]);

  if (!props.text) return null;

  if (!html) return <p>Loading...</p>;

  return (
    <span
      className="whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
