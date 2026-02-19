"use client";

import { BlogForm } from "@/components/blogs/blog-form";
import { BlogService } from "@/services/blog-service";
import { Blog } from "@/types/blog";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditBlogPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Fetch blog by slug from the API
                const response = await fetch(`${process.env.NEXT_PUBLIC_JAVA_BACKEND_URL}v1/blogs/${slug}`, {
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
            } catch (error) {
                toast.error("Failed to fetch blog details");
                router.push("/blogs");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlog();
        }
    }, [slug, router]);

    const handleSubmit = async (data: any) => {
        setSaving(true);
        try {
            // Assuming you have an API endpoint to update by slug
            const blogId = blog?.id;
            if (!blogId) {
                throw new Error("Blog ID not found");
            }
            
            await BlogService.update(blogId.toString(), data);
            toast.success("Blog updated successfully");
            router.push("/blogs");
            router.refresh();
        } catch (error) {
            toast.error("Failed to update blog");
        } finally {
            setSaving(false);
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
        return (
            <div className="text-center py-8 text-muted-foreground">
                Blog not found
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
            <BlogForm blog={blog} onSubmit={handleSubmit} isLoading={saving} />
        </div>
    );
}
