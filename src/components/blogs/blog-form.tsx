"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Blog, CreateBlogDto } from "@/types/blog";
import { RichTextEditor } from "@/components/blogs/rich-text-editor";
import { useState } from "react";
import { Loader2, UploadCloud, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { CDN_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { BlogService } from "@/services/blog-service";

function buildPreviewUrl(value: string): string | null {
    if (!value || !value.trim()) return null;
    // Already a blob or data URL (newly selected file)
    if (value.startsWith("blob:") || value.startsWith("data:")) return value;
    // Already a full URL
    try { new URL(value); return value; } catch { }
    // Relative CDN path — prepend CDN base
    if (CDN_BASE_URL && CDN_BASE_URL !== "undefined") {
        let cleanValue = value;
        // Map backend path to Cloudfront S3 key
        if (cleanValue.startsWith('/api/v1/blogs/images/')) {
            cleanValue = cleanValue.replace('/api/v1/blogs/images/', 'blogs/');
        }
        
        const cleanCdn = CDN_BASE_URL.endsWith('/') ? CDN_BASE_URL.slice(0, -1) : CDN_BASE_URL;
        const fullUrl = `${cleanCdn}/${cleanValue.startsWith('/') ? cleanValue.slice(1) : cleanValue}`;
        
        try { new URL(fullUrl); return fullUrl; } catch { }
    }
    return null;
}

const blogSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    content: z.string().min(1, "Content is required"),
    coverImageUrl: z.string().optional(),
    excerpt: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
    initialData?: Blog;
    onSubmit: (data: BlogFormValues & { coverImageFile?: File }) => void;
    isLoading: boolean;
}

export function BlogForm({ initialData, onSubmit, isLoading }: BlogFormProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    // Pending assets: files not yet uploaded (local blob previews)
    const [pendingAssets, setPendingAssets] = useState<{name: string, file: File, previewUrl: string}[]>([]);
    // Saved assets: already uploaded to server (have real URLs)
    const [savedAssets, setSavedAssets] = useState<{name: string, url: string}[]>([]);
    const [showAssetDropzone, setShowAssetDropzone] = useState(false);
    const [assetDragActive, setAssetDragActive] = useState(false);
    const [assetCounter, setAssetCounter] = useState(1);

    const form = useForm<BlogFormValues>({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            content: initialData?.content || "",
            coverImageUrl: initialData?.coverImageUrl || initialData?.imageUrl || "",
            excerpt: initialData?.excerpt || "",
            metaTitle: initialData?.metaTitle || "",
            metaDescription: initialData?.metaDescription || "",
        },
    });

    // Populate saved assets from initialData when editing
    useState(() => {
        if (initialData?.images && Array.isArray(initialData.images)) {
            const mappedAssets = initialData.images.map((img: any) => {
                const rawName = img.url.split('/').pop() || 'Existing Asset';
                const nameParts = rawName.split('_');
                const displayName = nameParts.length > 1 ? nameParts.slice(1).join('_') : rawName;
                return { name: displayName, url: img.url };
            });
            setSavedAssets(mappedAssets);

            let maxCounter = 0;
            mappedAssets.forEach(asset => {
                const match = asset.name.match(/-asset(\d+)\./);
                if (match && match[1]) {
                    const num = parseInt(match[1]);
                    if (num > maxCounter) maxCounter = num;
                }
            });
            setAssetCounter(maxCounter + 1);
        }
    });

    const processFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        setUploading(true);
        try {
            // Store the file for later submission
            setSelectedImageFile(file);

            // Create a preview URL
            const previewUrl = URL.createObjectURL(file);
            form.setValue("coverImageUrl", previewUrl);
            toast.success("Image selected successfully");
        } catch (error) {
            toast.error("Failed to process image");
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleAssetDropName = (files: FileList | File[]) => {
        if (!files || files.length === 0) return;

        const slug = form.getValues("slug");
        if (!slug) {
            toast.error("Please enter a slug first before uploading assets");
            return;
        }

        let currentCounter = assetCounter;
        const newPending: {name: string, file: File, previewUrl: string}[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const extension = file.name.split('.').pop() || 'jpg';
            const newName = `${slug}-asset${currentCounter}.${extension}`;
            const renamedFile = new File([file], newName, { type: file.type });
            const previewUrl = URL.createObjectURL(file);
            newPending.push({ name: newName, file: renamedFile, previewUrl });
            currentCounter++;
        }

        setPendingAssets(prev => [...prev, ...newPending]);
        setAssetCounter(currentCounter);
        toast.success(`${newPending.length} asset(s) queued — will upload when you save the blog`);
        setShowAssetDropzone(false);
    };

    const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleAssetDropName(Array.from(e.target.files));
            e.target.value = '';
        }
    };

    const handleAssetDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setAssetDragActive(true);
        } else if (e.type === "dragleave") {
            setAssetDragActive(false);
        }
    };

    const handleAssetDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setAssetDragActive(false);
        if (e.dataTransfer.files) {
            await handleAssetDropName(Array.from(e.dataTransfer.files));
        }
    };

    const handleFormSubmit = async (formData: BlogFormValues) => {
        // Validate required fields
        if (!formData.title || !formData.slug || !formData.content) {
            toast.error("Please fill in all required fields (Title, Slug, Content)");
            return;
        }

        // Upload all pending assets to server first
        const uploadedUrls: {url: string, sequence: number}[] = [];

        // Add existing saved assets first
        savedAssets.forEach((a, idx) => {
            uploadedUrls.push({ url: a.url, sequence: idx + 1 });
        });

        // Upload pending (new) assets
        if (pendingAssets.length > 0) {
            toast.info(`Uploading ${pendingAssets.length} asset(s)...`);
            for (const asset of pendingAssets) {
                try {
                    const result = await BlogService.uploadImage(asset.file);
                    uploadedUrls.push({ url: result.url, sequence: uploadedUrls.length + 1 });
                } catch (error) {
                    toast.error(`Failed to upload ${asset.name}`);
                    return; // Stop submission if asset upload fails
                }
            }
        }

        const submitData = {
            ...formData,
            coverImageFile: selectedImageFile || undefined,
            images: uploadedUrls,
        };

        onSubmit(submitData);
    };



    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Blog title"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            // Auto-fill slug if empty and not in edit mode (simple heuristic)
                                            if (!initialData && !form.getValues("slug")) {
                                                const slug = e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9]+/g, "-")
                                                    .replace(/^-+|-+$/g, "");
                                                form.setValue("slug", slug);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                    <Input placeholder="blog-slug" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Excerpt (Optional)</FormLabel>
                            <FormControl>
                                <textarea placeholder="Short summary..." className="h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Meta Title (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="SEO title (60 characters)" maxLength={60} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Meta Description (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="SEO description (160 characters)" maxLength={160} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Image</FormLabel>
                            <FormControl>
                                <div className="flex flex-col gap-4">
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${dragActive
                                            ? "border-primary bg-primary/5"
                                            : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <p className="text-sm text-muted-foreground">Uploading...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium">Drag and drop image here</p>
                                                        <p className="text-xs text-muted-foreground">or</p>
                                                        <Button
                                                            type="button"
                                                            variant="link"
                                                            className="h-auto p-0"
                                                            onClick={() => document.getElementById("image-upload")?.click()}
                                                        >
                                                            click to select
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {(() => {
                                        const previewUrl = buildPreviewUrl(field.value || "");
                                        return previewUrl ? (
                                            <div className="relative h-48 w-full md:w-1/2 rounded-md overflow-hidden border">
                                                <img src={previewUrl} alt="Cover" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => form.setValue("coverImageUrl", "")}
                                                    className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : null;
                                    })()}

                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4 border p-4 rounded-md">
                    <div>
                        <FormLabel>Blog Assets (Optional)</FormLabel>
                        <p className="text-sm text-muted-foreground mb-4">Upload assets like images for your blog content. A link will be generated to easily copy and paste into the editor.</p>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant={showAssetDropzone ? "secondary" : "outline"}
                                onClick={() => setShowAssetDropzone(!showAssetDropzone)}
                            >
                                {showAssetDropzone ? <X className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {showAssetDropzone ? "Cancel" : "Add Asset"}
                            </Button>
                        </div>
                    </div>

                    {showAssetDropzone && (
                        <div className="flex flex-col gap-4">
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 transition-colors ${assetDragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                    }`}
                                onDragEnter={handleAssetDrag}
                                onDragLeave={handleAssetDrag}
                                onDragOver={handleAssetDrag}
                                onDrop={handleAssetDrop}
                            >
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Drag and drop asset here</p>
                                        <p className="text-xs text-muted-foreground">or</p>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() => document.getElementById("asset-upload")?.click()}
                                        >
                                            click to select
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <input
                                id="asset-upload"
                                type="file"
                                className="hidden"
                                onChange={handleAssetUpload}
                                multiple
                                accept="image/*"
                            />
                        </div>
                    )}
                    
                    {/* Saved Assets (already on server) */}
                    {savedAssets.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">Saved Assets ({savedAssets.length})</p>
                            {savedAssets.map((asset, idx) => {
                                const fullUrl = buildPreviewUrl(asset.url) || asset.url;
                                return (
                                    <div key={`saved-${idx}`} className="flex items-center gap-3 border rounded-md p-2 bg-muted/20">
                                        <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0 border">
                                            <img src={fullUrl} alt={asset.name} className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate" title={asset.name}>{asset.name}</p>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5" title={fullUrl}>{fullUrl}</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="shrink-0"
                                            onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("Link copied!"); }}>
                                            <Copy className="h-3 w-3 mr-1" /> Copy
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm"
                                            className="shrink-0 text-destructive hover:text-destructive h-8 w-8 p-0"
                                            onClick={() => setSavedAssets(prev => prev.filter((_, i) => i !== idx))}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pending Assets (queued, not yet uploaded) */}
                    {pendingAssets.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <p className="text-xs font-medium text-amber-500">Pending Assets ({pendingAssets.length}) — will upload on save</p>
                            {pendingAssets.map((asset, idx) => (
                                <div key={`pending-${idx}`} className="flex items-center gap-3 border border-amber-500/30 rounded-md p-2 bg-amber-500/5">
                                    <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0 border">
                                        <img src={asset.previewUrl} alt={asset.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate" title={asset.name}>{asset.name}</p>
                                        <p className="text-xs text-amber-500 mt-0.5">Pending upload</p>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm"
                                        className="shrink-0 text-destructive hover:text-destructive h-8 w-8 p-0"
                                        onClick={() => {
                                            URL.revokeObjectURL(asset.previewUrl);
                                            setPendingAssets(prev => prev.filter((_, i) => i !== idx));
                                        }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value || ""}
                                    onChange={(html) => field.onChange(html)}
                                    placeholder="Start writing your blog content..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-center">
                    <Button type="submit" disabled={isLoading || uploading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Blog" : "Create Blog"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
