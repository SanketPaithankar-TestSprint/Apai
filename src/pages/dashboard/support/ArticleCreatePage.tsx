"use client"

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useNavigate, Link } from "react-router-dom"
import { articleService } from "@/services/article-service"
import { CreateArticleDto } from "@/types/article"
import { ArticleForm } from "@/components/support/article-form"
import { toast } from "sonner"
import { 
  ArrowLeft,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function ArticleCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ["help-categories"],
    queryFn: articleService.getCategories,
  })

  const createMutation = useMutation({
    mutationFn: (article: CreateArticleDto) => articleService.createArticle(article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-articles"] })
      toast.success("Article created successfully")
      navigate("/support?tab=articles")
    },
    onError: () => toast.error("Failed to create article"),
  })

  return (
    <div className="max-w-[1600px] w-full mx-auto py-6 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="rounded-none hover:bg-muted border-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-black tracking-tight leading-none">
          Create New Article
        </h1>
      </div>

      <ArticleForm
        categories={categories}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
