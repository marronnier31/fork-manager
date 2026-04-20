import React from "react";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", style, ...props }: TextareaProps) {
  return (
    <textarea
      className={`textarea ${className}`.trim()}
      style={{
        minHeight: 112,
        width: "100%",
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--foreground)",
        font: "inherit",
        lineHeight: 1.5,
        resize: "vertical",
        ...style
      }}
      {...props}
    />
  );
}
