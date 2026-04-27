"use client";

import dynamic from "next/dynamic";
import { memo, useEffect, useRef, useState } from "react";

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
  clipboard: { matchVisual: false },
};

const formats = ["header", "bold", "italic", "list", "blockquote", "link"];

function cleanHtml(html: string) {
  if (html === "<p><br></p>") return "";
  return html.replace(/&nbsp;/g, " ").replace(/ /g, " ");
}

// Internal editor — uncontrolled. Reads `initialValue` once, then keeps its
// own state. `onChange` is debounced (300ms) so the parent does not re-render
// on every keystroke (which causes input lag, especially on long content / paste).
function RichTextEditorInner({ value, onChange, placeholder, editorKey }: Props) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmittedRef = useRef(value);

  // If the editorKey changes (modal reopened with different record),
  // reset the local state to the new incoming value.
  useEffect(() => {
    setLocalValue(value);
    lastEmittedRef.current = value;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="quill-wrapper border border-white/30 dark:border-white/10 rounded-lg overflow-hidden">
      <ReactQuill
        key={editorKey}
        theme="snow"
        defaultValue={localValue}
        onChange={(html: string) => {
          const cleaned = cleanHtml(html);
          setLocalValue(cleaned);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            if (cleaned !== lastEmittedRef.current) {
              lastEmittedRef.current = cleaned;
              onChange(cleaned);
            }
          }, 300);
        }}
        onBlur={() => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          if (localValue !== lastEmittedRef.current) {
            lastEmittedRef.current = localValue;
            onChange(localValue);
          }
        }}
        modules={modules}
        formats={formats}
        placeholder={placeholder ?? "Tulis konten di sini..."}
      />
    </div>
  );
}

// memo: only re-render when editorKey/placeholder change. Critical — prevents
// parent state changes (other form fields, modal flicker, etc.) from forcing
// the heavy Quill DOM to re-render.
export const RichTextEditor = memo(
  RichTextEditorInner,
  (prev, next) =>
    prev.editorKey === next.editorKey &&
    prev.placeholder === next.placeholder,
);
