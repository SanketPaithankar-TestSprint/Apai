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
    <div className="max-w-[1600px] w-full mx-auto py-6 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="rounded-none hover:bg-muted shrink-0 border-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-black tracking-tight leading-none truncate max-w-2xl">
          Edit: {article.title}
        </h1>
      </div>

      <ArticleForm
        initialData={article}
        categories={categories}
        onSubmit={(data) => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}
