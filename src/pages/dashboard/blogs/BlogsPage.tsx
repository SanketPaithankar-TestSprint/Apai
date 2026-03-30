"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Blog } from "@/types/blog";
import { CDN_BASE_URL } from "@/constants/api";
import { BlogService } from "@/services/blog-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, MoreVertical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BlogsPage() {
  const navigate = useNavigate();
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
      } catch {
        return null;
      }
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-1 border-b-2 border-black mb-4">
        <div className="flex-1 flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight shrink-0">Blogs</h1>
          
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              className="pl-8 rounded-none border-2 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {searchQuery && (
            <Button variant="ghost" onClick={() => setSearchQuery("")} size="sm" className="h-9">
              Clear
            </Button>
          )}
          <Button asChild className="w-full sm:w-auto h-9 rounded-none font-bold text-xs uppercase" size="sm">
            <Link to="/blogs/new">
              <Plus className="mr-2 h-4 w-4" /> Create blog
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="border border-border rounded-none overflow-x-auto shadow-sm">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="p-0">
                  <EmptyState 
                    title="No Blogs Found"
                    description="You haven't created any blogs yet, or no blogs match your search query."
                    className="border-none bg-transparent py-24"
                    action={{
                      label: "Create First Blog",
                      onClick: () => navigate("/blogs/new"),
                      icon: Plus
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-border rounded-none overflow-x-auto shadow-sm">
          <table className="w-full text-xs">
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
                  <tr
                    key={blog.id || blog.slug || index}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="px-6 py-3">
                      <div className="w-48 h-20 bg-muted rounded relative overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={blog.title}
                            className="w-full h-full object-cover"
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
                            <a
                              href={`https://autopaneai.com/blogs/${blog.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/blogs/edit?slug=${blog.slug}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDelete(blog.id != null ? blog.id.toString() : blog.slug)
                            }
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

export default BlogsPage;

