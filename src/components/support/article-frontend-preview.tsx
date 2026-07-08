"use client";

import { BookOpen, Calendar, Clock3, Eye, Tag } from "lucide-react";

function getReadingMinutes(content: string) {
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!plainText) return 1;
    return Math.max(1, Math.ceil(plainText.split(" ").length / 220));
}

interface ArticleFrontendPreviewProps {
    title: string;
    description: string;
    categoryName?: string;
    content?: string;
    lastUpdated?: string;
    label?: string;
    hideSidebar?: boolean;
}

export function ArticleFrontendPreview({
    title,
    description,
    categoryName,
    content = "",
    lastUpdated,
    label = "Frontend Preview",
    hideSidebar = false,
}: ArticleFrontendPreviewProps) {
    const date = lastUpdated
        ? new Date(lastUpdated).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    return (
        <div className="admin-article-preview rounded-xl border bg-[#eef2f7] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Eye className="h-4 w-4 text-violet-600" />
                    {label}
                </div>
                <span className="rounded-full border bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Same article body
                </span>
            </div>

            <div className={`grid gap-4 ${
                hideSidebar ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_240px]"
            }`}>
                <div className="min-w-0 space-y-4">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            {categoryName && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                    <Tag className="h-3.5 w-3.5" />
                                    {categoryName}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                                <Calendar className="h-3.5 w-3.5" />
                                Last updated: {date}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {getReadingMinutes(content)} min read
                            </span>
                        </div>
                        <h1 className="mb-3 text-3xl font-black leading-tight tracking-normal text-slate-950">
                            {title || "Article title preview"}
                        </h1>
                        <p className="m-0 max-w-3xl text-base font-medium leading-7 text-slate-600">
                            {description || "Short article description will appear here."}
                        </p>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        {content ? (
                            <div className="admin-article-preview-content" dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
                                Start writing content to preview the help article body.
                            </div>
                        )}
                    </section>
                </div>

                {!hideSidebar && (
                    <aside className="hidden xl:block">
                        <div className="sticky top-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">
                                <BookOpen className="h-4 w-4 text-violet-600" />
                                Article guide
                            </div>
                            <div className="grid gap-2 text-xs font-semibold text-blue-600">
                                <span>H2 sections appear here</span>
                                <span>H3 steps appear here</span>
                                <span>Images open in preview on the user app</span>
                            </div>
                            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <div className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">Updated</div>
                                <div className="text-sm font-bold text-slate-700">{date}</div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
