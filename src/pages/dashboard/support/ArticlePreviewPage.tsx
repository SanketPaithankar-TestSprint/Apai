"use client";

import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { articleService } from "@/services/article-service";
import { ArticleFrontendPreview } from "@/components/support/article-frontend-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, BookOpen, Calendar, Edit3, Loader2 } from "lucide-react";

export default function ArticlePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["help-article", id],
    queryFn: () => articleService.getArticle(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground">Loading article preview...</p>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <BookOpen className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Article not found</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            The article preview could not be loaded.
          </p>
        </div>
        <Button onClick={() => navigate("/support?tab=articles")} variant="outline" className="rounded-xl">
          Go Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 px-4 py-8 duration-500">
      <div className="mb-6">
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
                <Link to="/support?tab=articles">Support Hub</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Preview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/support?tab=articles")}
            className="shrink-0 rounded-none border-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold uppercase leading-none tracking-widest text-muted-foreground">
                Article Preview
              </span>
            </div>
            <h1 className="mb-4 max-w-3xl truncate text-3xl font-black leading-none tracking-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              {article.categoryName && (
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 font-bold text-primary">
                  {article.categoryName}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Last Updated: {article.lastUpdated ? new Date(article.lastUpdated).toLocaleDateString() : "Unknown"}
              </div>
            </div>
          </div>
        </div>

        <Button asChild className="h-10 rounded-none px-5 text-xs font-bold uppercase tracking-widest">
          <Link to={`/support/articles/edit/${article.id}`}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Article
          </Link>
        </Button>
      </div>

      <ArticleFrontendPreview
        title={article.title}
        description={article.description}
        categoryName={article.categoryName}
        content={article.content}
        lastUpdated={article.lastUpdated}
        label="Standalone Preview"
      />
    </div>
  );
}
