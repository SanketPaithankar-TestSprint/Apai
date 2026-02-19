"use client";

import { BlogForm } from "@/components/blogs/blog-form";
import { BlogService } from "@/services/blog-service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            console.log("Creating blog with data:", data);
            const result = await BlogService.create(data);
            console.log("Blog created successfully:", result);
            toast.success("Blog created successfully");
            router.push("/blogs");
            router.refresh();
        } catch (error) {
            console.error("Error creating blog:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to create blog";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Blog</h1>
            <div className="border rounded-lg p-6 bg-card">
                <BlogForm onSubmit={handleSubmit} isLoading={loading} />
            </div>
        </div>
    );
}
