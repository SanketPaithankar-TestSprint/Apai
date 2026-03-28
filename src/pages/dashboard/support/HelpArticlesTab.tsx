"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { articleService } from "@/services/article-service"
import { HelpArticle } from "@/types/article"
import { 
  Search, 
  Plus, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Loader2,
  FileText,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { CategoryManager } from "@/components/support/category-manager"

export function HelpArticlesTab() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [archivedFilter, setArchivedFilter] = useState<string>("active")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [page, setPage] = useState(0)
  
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false)

  // Fetch Categories for filters
  const { data: categories = [] } = useQuery({
    queryKey: ["help-categories"],
    queryFn: articleService.getCategories,
  })

  // Fetch Articles
  const { data, isLoading, error } = useQuery({
    queryKey: ["help-articles", categoryFilter, archivedFilter, searchQuery, startDate, endDate, page],
    queryFn: () => articleService.getArticles({
        categoryId: categoryFilter === "ALL" ? undefined : parseInt(categoryFilter),
        search: searchQuery,
        archived: archivedFilter === "active" ? false : archivedFilter === "archived" ? true : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: page,
        limit: 10
    }),
  })

  const articles = data?.content || []
  const totalElements = data?.totalElements || 0
  const totalPages = data?.totalPages || 0

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articleService.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-articles"] })
      toast.success("Article deleted successfully")
    },
    onError: () => toast.error("Failed to delete article"),
  })

  const handleEdit = (article: HelpArticle) => {
    navigate(`/support/articles/edit/${article.id}`)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Help Articles
          </h2>
          <p className="text-muted-foreground">Manage self-service support documents and guides.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                onClick={() => setIsCategoryManageOpen(true)}
                className="rounded-xl border-dashed border-2 bg-muted/30 font-bold"
            >
                <Settings className="w-4 h-4 mr-2" />
                Manage Categories
            </Button>
            <Button 
                onClick={() => navigate("/support/articles/create")}
                className="rounded-xl shadow-lg px-6 font-bold"
            >
                <Plus className="w-4 h-4 mr-2" />
                New Article
            </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="pl-10 h-11 bg-background rounded-lg border-2 border-border/10 focus-visible:border-primary/50"
          />
        </div>
        
        <div className="lg:col-span-2">
            <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setPage(0); }}>
            <SelectTrigger className="h-11 bg-background border-2 border-border/10 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Category" />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <div className="lg:col-span-2">
            <Select value={archivedFilter} onValueChange={(val) => { setArchivedFilter(val); setPage(0); }}>
                <SelectTrigger className="h-11 bg-background border-2 border-border/10 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Status" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="archived">Archived Only</SelectItem>
                    <SelectItem value="all">All (Incl. Archived)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="lg:col-span-4 flex gap-2">
            <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                    className="pl-10 h-11 bg-background rounded-lg border-2 border-border/10 text-xs"
                    title="Start Date"
                />
            </div>
            <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                    className="pl-10 h-11 bg-background rounded-lg border-2 border-border/10 text-xs"
                    title="End Date"
                />
            </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-20 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading articles...</div>
        ) : error ? (
            <div className="p-20 text-center text-destructive">Failed to load articles. Please check your connection.</div>
        ) : articles.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed p-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-1">No articles found</h3>
                <p className="text-muted-foreground mb-6">Get started by creating your first help article.</p>
                <Button onClick={() => navigate("/support/articles/create")} variant="outline" className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                </Button>
            </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-6 py-4 font-bold text-muted-foreground">Title</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">Category</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">Last Updated</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(article)}>
                                {article.title}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[300px] mt-0.5">
                                {article.description}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-secondary/50 font-medium">
                        {article.categoryName}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {article.archived ? (
                        <span className="flex items-center text-slate-500 font-bold text-xs uppercase tracking-wider">
                           <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Archived
                        </span>
                      ) : article.published ? (
                        <span className="flex items-center text-green-600 font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-600 font-bold text-xs uppercase tracking-wider">
                          <XCircle className="w-3.5 h-3.5 mr-1.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5" />
                             {article.lastUpdated ? new Date(article.lastUpdated).toLocaleDateString() : "Never"}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(article)} className="h-8 w-8 rounded-full">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)} className="h-8 w-8 rounded-full text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="bg-muted/10 px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                    Showing <span className="text-foreground">{articles.length}</span> of <span className="text-foreground">{totalElements}</span> results
                </p>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="text-xs h-8 rounded-lg"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center px-4 text-xs font-bold bg-muted/50 rounded-lg">
                        Page {page + 1} of {totalPages || 1}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="text-xs h-8 rounded-lg"
                    >
                        Next
                    </Button>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      <Dialog open={isCategoryManageOpen} onOpenChange={setIsCategoryManageOpen}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-muted/20">
            <DialogTitle className="text-xl font-black tracking-tight">Category Dashboard</DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <CategoryManager />
          </div>
          <div className="p-6 bg-muted/30 border-t flex justify-end">
             <Button 
                variant="outline" 
                onClick={() => setIsCategoryManageOpen(false)} 
                className="rounded-xl font-bold hover:bg-muted hover:text-foreground border-border"
             >
                 Close
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
