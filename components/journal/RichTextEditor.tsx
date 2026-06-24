"use client";

import { useEditor, EditorContent, type Editor, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import React, { useCallback, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

// ─── Toolbar Button ──────────────────────────────────────────────────────────
function ToolbarButton({
  onClick,
  isActive = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        isActive
          ? "bg-[var(--tz-accent)] text-white"
          : "text-[var(--tz-text-muted)] hover:bg-[var(--tz-hover-bg)] hover:text-[var(--tz-text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        editor.chain().focus().setImage({ src: result }).run();
      };
      reader.readAsDataURL(file);

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [editor],
  );

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--tz-border-subtle)] flex-wrap"
      role="toolbar"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
      >
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
      >
        <Redo size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-[var(--tz-border-subtle)] mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline"
      >
        <UnderlineIcon size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-[var(--tz-border-subtle)] mx-1" />

      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-[var(--tz-border-subtle)] mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-[var(--tz-border-subtle)] mx-1" />

      <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Add Link">
        <LinkIcon size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        <ImageIcon size={14} />
      </ToolbarButton>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}

// ─── Rich Text Editor Component ──────────────────────────────────────────────
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your notes...",
  className = "",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      ImageResize.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
            }
          };
        },
        renderHTML({ HTMLAttributes }) {
          const styleVal = HTMLAttributes.containerStyle || HTMLAttributes.style || "";
          return [
            "img",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
              style: styleVal,
            }),
          ];
        }
      }).configure({
        allowBase64: true,
        inline: true,
        HTMLAttributes: {
          class: "rounded-lg my-2",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--tz-accent)] underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2",
        style: `min-height: ${minHeight}`,
      },
      handlePaste: (view, event) => {
        // Handle pasted images
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (!file) return false;

              const reader = new FileReader();
              reader.onload = () => {
                const src = reader.result as string;
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src }),
                  ),
                );
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Sync external content changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
    // Only re-sync when content prop changes from outside, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  return (
    <div
      className={`rounded-xl border border-[var(--tz-border)] bg-[var(--tz-bg-card)] overflow-hidden ${className}`}
    >
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="tiptap-editor text-[var(--tz-text-primary)] text-sm"
      />
      <div className="flex items-center justify-end px-3 py-1 border-t border-[var(--tz-border-subtle)]">
        <span className="text-[10px] text-[var(--tz-text-muted)]">
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} chars
        </span>
      </div>
    </div>
  );
}
