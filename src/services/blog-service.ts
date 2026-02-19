import { Blog, CreateBlogDto, UpdateBlogDto } from "@/types/blog";

const API_URL = "/api/blogs";

export const BlogService = {
    async getAll(query?: string): Promise<Blog[]> {
        const url = query ? `${API_URL}?${query}` : API_URL;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch blogs");
        return response.json();
    },

    async getById(id: string): Promise<Blog> {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch blog");
        return response.json();
    },

    async create(data: CreateBlogDto & { coverImageFile?: File }): Promise<Blog> {
        const formData = new FormData();
        
        // Add blog data as JSON string
        const blogData = {
            title: data.title,
            slug: data.slug,
            content: data.content,
            excerpt: data.excerpt || null,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            // Don't send coverImageUrl if we have the actual file - only send if no file
            coverImageUrl: data.coverImageFile ? null : (data.coverImageUrl || null),
        };
        
        console.log("Blog data to send:", JSON.stringify(blogData, null, 2));
        formData.append("data", JSON.stringify(blogData));
        
        // Add cover image file if provided
        if (data.coverImageFile) {
            console.log("Adding cover image file:", data.coverImageFile.name, "Size:", data.coverImageFile.size);
            formData.append("coverImage", data.coverImageFile);
        }

        try {
            console.log("Sending POST request to:", `${API_URL}`);
            const response = await fetch(`${API_URL}`, {
                method: "POST",
                body: formData,
            });
            
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Response error (raw):", errorText);
                
                // Try to parse as JSON for better logging
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error("Response error (parsed):", JSON.stringify(errorJson, null, 2));
                } catch (e) {
                    // If not JSON, just show the raw text
                }
                
                throw new Error(`Failed to create blog: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log("Blog created:", result);
            return result;
        } catch (error) {
            console.error("Create error:", error);
            throw error;
        }
    },

    async update(id: string, data: UpdateBlogDto): Promise<Blog> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update blog");
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete blog");
    },

    async uploadImage(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/upload-image`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload image");
        return response.json();
    },
};
