"use client";

import { Blog } from "@/types/blog";
import { CDN_BASE_URL } from "@/constants/api";
import { format } from "date-fns";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

interface BlogCardProps {
    blog: Blog;
    onDelete: (id: string) => void;
}

export function BlogCard({ blog, onDelete }: BlogCardProps) {
    const imageUrlPath = blog.coverImageUrl || blog.imageUrl;
    // Validate image URL path and CDN base URL
    const isValidImagePath = imageUrlPath && imageUrlPath.trim() && !imageUrlPath.includes("undefined");
    const isValidCdnUrl = CDN_BASE_URL && CDN_BASE_URL.trim() && CDN_BASE_URL !== "undefined";

    // Construct full CDN URL only if both parts are valid
    let image: string | null = null;
    if (isValidImagePath && isValidCdnUrl) {
        try {
            image = `${CDN_BASE_URL}${imageUrlPath}`;
            // Validate it's a proper URL
            new URL(image);
        } catch (e) {
            image = null;
        }
    }

    // Use slug or id for links. Note: If id is missing, ensure backend supports slug.
    const linkId = blog.slug || blog.id!;

    return (
        <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full bg-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={blog.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="line-clamp-2 text-lg" title={blog.title}>
                            {blog.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-mono">
                            /{blog.slug}
                        </p>
                        {blog.excerpt && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                {blog.excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                {/* Content removed from card as specificed, using excerpt in header or here */}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blogs/${linkId}`}>
                        View Details <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/blogs/${linkId}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(blog.id != null ? blog.id.toString() : blog.slug)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
