"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CDN_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BlogDetail {
  id: number;
  title: string;
  slug: string;
  coverImageUrl: string;
  authorId: number;
  createdAt: string;
  readTimeMinutes: number;
  content: string;
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function BlogViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get("slug");

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchWithAuth(`${API_ENDPOINTS.BLOGS}/${slug}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch blog");

        const data = await response.json();
        setBlog(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load blog";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const getImageUrl = (imageUrlPath: string | null): string | null => {
    if (!imageUrlPath) return null;
    const isValidImagePath = imageUrlPath.trim() && !imageUrlPath.includes("undefined");
    const isValidCdnUrl = CDN_BASE_URL && CDN_BASE_URL.trim() && CDN_BASE_URL !== "undefined";

    if (isValidImagePath && isValidCdnUrl) {
      if (imageUrlPath.startsWith("http")) return imageUrlPath;

      let cleanValue = imageUrlPath;
      if (cleanValue.startsWith("/api/v1/blogs/images/")) {
        cleanValue = cleanValue.replace("/api/v1/blogs/images/", "blogs/");
      }

      const cdnUrl = CDN_BASE_URL || "";
      const cleanCdn = cdnUrl.endsWith("/") ? cdnUrl.slice(0, -1) : cdnUrl;
      const fullUrl = `${cleanCdn}/${cleanValue.startsWith("/") ? cleanValue.slice(1) : cleanValue}`;

      try {
        new URL(fullUrl);
        return fullUrl;
      } catch {
        return null;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="py-12">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <p>{error || "Blog not found"}</p>
        </div>
      </div>
    );
  }

  const coverImageUrl = getImageUrl(blog.coverImageUrl);
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/blogs">Blogs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                className="max-w-[150px] sm:max-w-[300px] truncate"
                title={blog.title}
              >
                {blog.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {coverImageUrl && (
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
          <img src={coverImageUrl} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{blog.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>Published on {formattedDate}</span>
          <span>•</span>
          <span>{blog.readTimeMinutes} min read</span>
          <span>•</span>
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">/{blog.slug}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Blog ID</p>
          <p className="text-sm font-medium">{blog.id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Author ID</p>
          <p className="text-sm font-medium">{blog.authorId}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Read Time</p>
          <p className="text-sm font-medium">{blog.readTimeMinutes} minutes</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert mb-12">
        {blog.excerpt && (
          <div className="bg-muted/50 border-l-4 border-primary p-4 mb-6 rounded">
            <p className="text-sm italic text-muted-foreground">{blog.excerpt}</p>
          </div>
        )}
        <div className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>

      {(blog.metaTitle || blog.metaDescription) && (
        <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold mb-4">SEO Meta Information</h3>
          {blog.metaTitle && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1">Meta Title</p>
              <p className="text-sm">{blog.metaTitle}</p>
            </div>
          )}
          {blog.metaDescription && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Meta Description</p>
              <p className="text-sm">{blog.metaDescription}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Button>
        <Button asChild variant="outline">
          <Link to={`/blogs/edit?slug=${blog.slug}`}>Edit Blog</Link>
        </Button>
        <Button asChild>
          <a
            href={`https://autopaneai.com/blogs/${blog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Public Blog
          </a>
        </Button>
      </div>
    </div>
  );
}

export default BlogViewPage;

