"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Blog } from "@/types/blog";
import { CDN_BASE_URL } from "@/constants/api";
import { BlogService } from "@/services/blog-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, Edit, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BlogsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const data = await BlogService.getAll();
      return Array.isArray(data) ? data : (data as any).data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BlogService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete blog");
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    deleteMutation.mutate(id);
  };

  const getFilteredBlogs = () => {
    let filtered = [...blogs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          (blog.slug && blog.slug.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredBlogs = getFilteredBlogs();

  const getImageUrl = (blog: Blog): string | null => {
    const imageUrlPath = blog.coverImageUrl || blog.imageUrl;
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
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/blogs/new">
            <Plus className="mr-2 h-4 w-4" /> Create Blog
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" onClick={() => setSearchQuery("")}>
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
          No blogs found.
        </div>
      ) : (
        <div className="border border-border rounded-none overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-medium">Image</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog, index) => {
                const imageUrl = getImageUrl(blog);
                return (
                  <tr key={blog.id || blog.slug || index} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-3">
                      <div className="w-48 h-20 bg-muted rounded relative overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{blog.title}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground font-mono">/{blog.slug}</td>
                    <td className="px-6 py-3 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-muted rounded transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/blogs/${blog.slug}`}>
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/blogs/${blog.slug}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(blog.id!)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
