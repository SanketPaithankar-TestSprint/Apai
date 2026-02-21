export interface Blog {
    id?: number; // Numeric ID from backend (used for PUT/DELETE by ID)
    title: string;
    content?: string; // HTML string - populated in detail/edit view
    author?: string;
    authorId?: number;
    imageUrl?: string; // Deprecated, use coverImageUrl
    coverImageUrl?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
    status?: "Draft" | "Published" | "Archived";
    createdAt?: string;
    updatedAt?: string;
    readTimeMinutes?: number;
    readCount?: number;
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
    searchQuery?: string;
    coverImageUrl?: string;
    imageUrl?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> { }
