"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { BlogForm } from "@/components/blogs/blog-form";
import { BlogService } from "@/services/blog-service";
import type { Blog } from "@/types/blog";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_ENDPOINTS } from "@/constants/api";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function BlogEditPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!slug) {
          navigate("/blogs", { replace: true });
          return;
        }

        const response = await fetchWithAuth(`${API_ENDPOINTS.BLOGS}/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch blog");

        const data = await response.json();
        setBlog(data);
      } catch {
        toast.error("Failed to fetch blog details");
        navigate("/blogs", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, navigate]);

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      const blogId = blog?.id;
      if (!blogId) throw new Error("Blog ID not found");

      await BlogService.update(blogId.toString(), data);

      toast.success("Blog updated successfully");
      navigate("/blogs");
    } catch {
      toast.error("Failed to update blog");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!blog?.id) return;
    setDeleting(true);
    try {
      await BlogService.delete(blog.id.toString());

      toast.success("Blog deleted successfully");
      navigate("/blogs");
    } catch {
      toast.error("Failed to delete blog");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return <div className="text-center py-8 text-muted-foreground">Blog not found</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
              <BreadcrumbLink
                asChild
                className="max-w-[150px] truncate"
                title={blog.title}
              >
                <Link to={`/blogs/view?slug=${blog.slug}`}>{blog.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Edit Blog</h1>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="rounded-none font-bold text-xs uppercase h-9">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Blog
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the blog
                <span className="font-bold text-foreground"> "{blog.title}"</span> and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Blog"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <BlogForm initialData={blog} onSubmit={handleSubmit} isLoading={saving} />
      </div>
    </div>
  );
}

export default BlogEditPage;

