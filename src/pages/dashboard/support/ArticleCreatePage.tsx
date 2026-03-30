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
              <BreadcrumbPage>New Article</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-none hover:bg-muted border-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Support Hub</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Create New Article</h1>
          </div>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-none p-8 shadow-sm">
        <ArticleForm
          categories={categories}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
