"use client";

import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("./quill-editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] border border-white/30 dark:border-white/10 rounded-lg bg-white/20 dark:bg-white/5 animate-pulse" />
  ),
});

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editorKey?: string;
}

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

const formats = ["header", "bold", "italic", "list", "blockquote", "link"];

export function RichTextEditor({ value, onChange, placeholder, editorKey }: Props) {
  return (
    <div className="quill-wrapper border border-white/30 dark:border-white/10 rounded-lg overflow-hidden">
      <ReactQuill
        key={editorKey}
        theme="snow"
        value={value}
        onChange={(html) => {
          if (html === "<p><br></p>") return onChange("");
          // Replace non-breaking spaces with regular spaces so text wraps normally on display
          const cleaned = html.replace(/&nbsp;/g, " ").replace(/ /g, " ");
          onChange(cleaned);
        }}
        modules={modules}
        formats={formats}
        placeholder={placeholder ?? "Tulis konten di sini..."}
      />
    </div>
  );
}
