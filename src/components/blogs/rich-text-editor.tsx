"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    Alignment,
    AutoImage,
    BlockQuote,
    Bold,
    ClassicEditor,
    Code,
    CodeBlock,
    Essentials,
    FontColor,
    Heading,
    HorizontalLine,
    Image,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    Indent,
    IndentBlock,
    Italic,
    Link,
    List,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    SelectAll,
    SourceEditing,
    Strikethrough,
    Table,
    TableToolbar,
    Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
}

const editorConfig = {
    licenseKey: "GPL",
    plugins: [
        Alignment,
        AutoImage,
        BlockQuote,
        Bold,
        Code,
        CodeBlock,
        Essentials,
        FontColor,
        Heading,
        HorizontalLine,
        Image,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        Indent,
        IndentBlock,
        Italic,
        Link,
        List,
        Paragraph,
        PasteFromOffice,
        RemoveFormat,
        SelectAll,
        SourceEditing,
        Strikethrough,
        Table,
        TableToolbar,
        Underline,
    ],
    toolbar: {
        items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "fontColor",
            "removeFormat",
            "|",
            "link",
            "insertImage",
            "insertTable",
            "horizontalLine",
            "|",
            "bulletedList",
            "numberedList",
            "outdent",
            "indent",
            "|",
            "alignment",
            "blockQuote",
            "code",
            "codeBlock",
            "|",
            "sourceEditing",
        ],
        shouldNotGroupWhenFull: true,
    },
    heading: {
        options: [
            { model: "paragraph" as const, title: "Paragraph", class: "ck-heading_paragraph" },
            { model: "heading2" as const, view: "h2", title: "Section", class: "ck-heading_heading2" },
            { model: "heading3" as const, view: "h3", title: "Step", class: "ck-heading_heading3" },
            { model: "heading4" as const, view: "h4", title: "Subsection", class: "ck-heading_heading4" },
        ],
    },
    image: {
        toolbar: [
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "|",
            "resizeImage",
        ],
        insert: {
            type: "block" as const,
        },
        resizeOptions: [
            { name: "resizeImage:original", value: null, label: "Original" },
            { name: "resizeImage:50", value: "50", label: "50%" },
            { name: "resizeImage:75", value: "75", label: "75%" },
        ],
    },
    table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
    },
    placeholder: "Start writing the article...",
};

function normalizeEditorHtml(html: string) {
    const cleaned = html.trim();
    if (!cleaned || cleaned === "<p>&nbsp;</p>" || cleaned === "<p></p>") return "";
    return cleaned;
}

export function RichTextEditor({ value, onChange, onBlur, placeholder, className }: RichTextEditorProps) {
    const emitChange = (editor: ClassicEditor) => {
        onChange(normalizeEditorHtml(editor.getData()));
    };

    return (
        <div className={cn("apai-ckeditor rounded-lg border bg-background", className)}>
            <CKEditor
                editor={ClassicEditor}
                data={value || ""}
                config={{
                    ...editorConfig,
                    placeholder: placeholder || editorConfig.placeholder,
                }}
                onReady={(editor) => {
                    if (editor.plugins.has("SourceEditing")) {
                        const sourceEditing = editor.plugins.get("SourceEditing");
                        
                        // Sync when toggling Source Editing mode on/off
                        sourceEditing.on("change:isSourceEditingMode", () => {
                            emitChange(editor);
                        });

                        // Sync on input/keystrokes inside the source editing textarea
                        editor.ui.view.element?.addEventListener("input", () => {
                            if (sourceEditing.isSourceEditingMode) {
                                setTimeout(() => {
                                    emitChange(editor);
                                }, 50);
                            }
                        });
                    }
                }}
                onChange={(_, editor) => {
                    emitChange(editor);
                }}
                onBlur={(_, editor) => {
                    emitChange(editor);
                    onBlur?.();
                }}
            />
        </div>
    );
}
