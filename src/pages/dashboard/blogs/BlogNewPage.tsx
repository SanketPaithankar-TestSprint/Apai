"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { BlogForm } from "@/components/blogs/blog-form";
import { BlogService } from "@/services/blog-service";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { AuditAction, TARGET_TYPES } from "@/types/audit-logs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function BlogNewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLogs();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const result = await BlogService.create(data);
      const blogId = result?.id || data.slug || "new-blog";
      
      logAction(
        2,
        "Sanket Paithankar",
        AuditAction.ARTICLE_CREATED,
        TARGET_TYPES.ARTICLE,
        blogId.toString(),
        null,
        data
      ).catch(console.error);
      
      toast.success("Blog created successfully");
      navigate("/blogs");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create blog";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              <BreadcrumbPage>Create New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <h1 className="text-3xl font-bold mb-6">Create New Blog</h1>
      <div className="border rounded-lg p-6 bg-card">
        <BlogForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}

export default BlogNewPage;

