"use client"

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useNavigate, useParams, Link } from "react-router-dom"
import { articleService } from "@/services/article-service"
import { UpdateArticleDto } from "@/types/article"
import { ArticleForm } from "@/components/support/article-form"
import { toast } from "sonner"
import { 
  ArrowLeft,
  BookOpen,
  Loader2,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["help-categories"],
    queryFn: articleService.getCategories,
  })

  // Fetch Article Details
  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["help-article", id],
    queryFn: () => articleService.getArticle(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateArticleDto) => articleService.updateArticle(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-articles"] })
      queryClient.invalidateQueries({ queryKey: ["help-article", id] })
      toast.success("Article updated successfully")
      navigate("/support?tab=articles")
    },
    onError: () => toast.error("Failed to update article"),
  })

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Loading article details...</p>
        </div>
    )
  }

  if (isError || !article) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <ArrowLeft className="w-8 h-8 text-destructive" />
            </div>
            <div>
                <h3 className="text-xl font-bold">Article not found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">The article you're trying to edit doesn't exist or you don't have permission to access it.</p>
            </div>
            <Button onClick={() => navigate("/support?tab=articles")} variant="outline" className="rounded-xl">
                Go Back to Support Hub
            </Button>
        </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <BreadcrumbLink 
                asChild 
                title={article.title}
                className="max-w-[150px] truncate"
              >
                <Link to={`/support/articles/edit/${id}`}>{article.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-xl hover:bg-muted shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none">Edit Article</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-none mb-4 truncate max-w-xl">{article.title}</h1>
            <div className="flex flex-wrap gap-4 items-center">
                <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 px-3 py-1 font-bold">
                    {article.categoryName}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Updated: {article.lastUpdated ? new Date(article.lastUpdated).toLocaleDateString() : "Unknown"}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-primary/5 transition-all hover:shadow-2xl hover:shadow-primary/5 border-t-4 border-t-primary">
        <ArticleForm
          initialData={article}
          categories={categories}
          onSubmit={(data) => updateMutation.mutate(data)}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
