export interface Blog {
    id?: string; // Optional because list view might not return it? Or maybe slug is unique.
    title: string;
    content?: string; // Optional in list view
    author?: string; // Optional in list view
    imageUrl?: string; // Deprecated, use coverImageUrl
    coverImageUrl?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
    status?: "Draft" | "Published" | "Archived";
    createdAt?: string;
    updatedAt?: string;
}

export interface BlogListResponse {
    data: Blog[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateBlogDto {
    title: string;
    content: string;
    status: "Draft" | "Published";
    imageUrl?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> { }
