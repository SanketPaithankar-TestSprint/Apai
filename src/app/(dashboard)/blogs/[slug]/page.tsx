"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CDN_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_ENDPOINTS.BLOGS}/${slug}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch blog");
        }

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
    const isValidImagePath = imageUrlPath && imageUrlPath.trim() && !imageUrlPath.includes("undefined");
    const isValidCdnUrl = CDN_BASE_URL && CDN_BASE_URL.trim() && CDN_BASE_URL !== "undefined";
    
    if (isValidImagePath && isValidCdnUrl) {
      try {
        const fullUrl = `${CDN_BASE_URL}${imageUrlPath}`;
        new URL(fullUrl);
        return fullUrl;
      } catch (e) {
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
          <Button variant="outline" onClick={() => router.back()}>
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
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* Cover Image */}
      {coverImageUrl && (
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={coverImageUrl}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Blog Header */}
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

      {/* Blog Meta Information */}
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

      {/* Blog Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert mb-12">
        {blog.excerpt && (
          <div className="bg-muted/50 border-l-4 border-primary p-4 mb-6 rounded">
            <p className="text-sm italic text-muted-foreground">{blog.excerpt}</p>
          </div>
        )}
        
        <div
          className="text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Meta Information */}
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blogs
        </Button>
        <Button asChild>
          <Link href={`/blogs/${blog.id}/edit`}>Edit Blog</Link>
        </Button>
      </div>
    </div>
  );
}
