"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState, useRef } from "react";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    List,
    ListOrdered,
    Quote,
    Code,
    Code2,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    ImageIcon,
    Undo,
    Redo,
    Minus,
    CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "p-1.5 rounded-md text-sm transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
        >
            {children}
        </button>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-5 bg-border mx-0.5" />;
}

export function RichTextEditor({ value, onChange, placeholder = "Start writing your blog content...", className }: RichTextEditorProps) {
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const initialSyncDone = useRef(false);
    const suppressUpdateRef = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            TextStyle,
            Color,
            Link.extend({
                // Explicitly capture href / target / rel from stored HTML.
                // Without these parseHTML functions Tiptap drops attributes
                // that don't match the mark's expected serialisation format.
                addAttributes() {
                    return {
                        href: {
                            default: null,
                            parseHTML: (el) => el.getAttribute('href'),
                        },
                        target: {
                            default: null,
                            parseHTML: (el) => el.getAttribute('target'),
                        },
                        rel: {
                            default: null,
                            parseHTML: (el) => el.getAttribute('rel'),
                        },
                        class: {
                            default: null,
                        },
                    };
                },
                parseHTML() {
                    // Accept ANY <a href="..."> regardless of extra attributes
                    return [{ tag: 'a[href]' }];
                },
            }).configure({
                openOnClick: false,
                autolink: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-2',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-md max-w-full",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || "",
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            // Don't propagate changes that come from setContent() during initial sync
            if (suppressUpdateRef.current) return;
            const html = editor.getHTML();
            onChange(html === "<p></p>" ? "" : html);
        },
        immediatelyRender: false,
    });

    // One-shot sync: once the editor is ready, load the initial value.
    // This handles the async gap between Tiptap's deferred init and the value prop.
    useEffect(() => {
        if (!editor || initialSyncDone.current) return;
        if (value) {
            suppressUpdateRef.current = true;
            editor.commands.setContent(value);
            // Release the guard after the update has been committed
            requestAnimationFrame(() => {
                suppressUpdateRef.current = false;
            });
        }
        initialSyncDone.current = true;
    }, [editor, value]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const trimmed = linkUrl.trim();
        if (!trimmed) {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().setLink({ href: trimmed }).run();
        }
        setLinkUrl("");
        setIsLinkDialogOpen(false);
    }, [editor, linkUrl]);

    const insertImage = useCallback(() => {
        if (!editor) return;
        const trimmed = imageUrl.trim();
        if (trimmed) {
            editor.chain().focus().setImage({ src: trimmed }).run();
        }
        setImageUrl("");
        setIsImageDialogOpen(false);
    }, [editor, imageUrl]);

    if (!editor) return null;

    return (
        <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
                {/* History */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    isActive={editor.isActive("heading", { level: 4 })}
                    title="Heading 4"
                >
                    <Heading4 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Inline Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive("underline")}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive("code")}
                    title="Inline Code"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Blocks */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive("codeBlock")}
                    title="Code Block"
                >
                    <Code2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Rule (---)"
                >
                    <Minus className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    title="Line Break (<br>)"
                >
                    <CornerDownLeft className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    isActive={editor.isActive({ textAlign: "left" })}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    isActive={editor.isActive({ textAlign: "center" })}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    isActive={editor.isActive({ textAlign: "right" })}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Link */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => {
                            setLinkUrl(editor.getAttributes("link").href || "");
                            setIsLinkDialogOpen((prev) => !prev);
                            setIsImageDialogOpen(false);
                        }}
                        isActive={editor.isActive("link")}
                        title="Insert Link"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </ToolbarButton>
                    {isLinkDialogOpen && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-background border rounded-lg shadow-lg p-3 flex gap-2 min-w-[280px]">
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1 text-sm px-2 py-1 rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                onKeyDown={(e) => e.key === "Enter" && setLink()}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={setLink}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                            >
                                Set
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLinkDialogOpen(false)}
                                className="px-2 py-1 text-sm border rounded hover:bg-muted"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* Image */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => {
                            setIsImageDialogOpen((prev) => !prev);
                            setIsLinkDialogOpen(false);
                        }}
                        title="Insert Image URL"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>
                    {isImageDialogOpen && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-background border rounded-lg shadow-lg p-3 flex gap-2 min-w-[320px]">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 text-sm px-2 py-1 rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                onKeyDown={(e) => e.key === "Enter" && insertImage()}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={insertImage}
                                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                            >
                                Insert
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsImageDialogOpen(false)}
                                className="px-2 py-1 text-sm border rounded hover:bg-muted"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="min-h-[300px] cursor-text"
                onClick={() => editor.commands.focus()}
            />

            {/* Footer: char count hint */}
            <div className="border-t px-4 py-1.5 text-xs text-muted-foreground flex justify-between">
                <span>Rich text editor — output is HTML</span>
                <span>{editor.storage.characterCount?.characters?.() ?? ""}</span>
            </div>
        </div>
    );
}
