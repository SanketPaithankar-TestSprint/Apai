"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { articleService } from "@/services/article-service"
import { HelpCategory } from "@/types/article"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Trash2, 
  Settings2, 
  MoreVertical, 
  FolderOpen,
  Loader2,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function CategoryManager() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [selectedCat, setSelectedCat] = useState<HelpCategory | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["help-categories"],
    queryFn: articleService.getCategories,
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => articleService.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-categories"] })
      setNewCatName("")
      setIsCreateOpen(false)
      toast.success("Category created successfully")
    },
    onError: () => toast.error("Failed to create category"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => articleService.updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-categories"] })
      setIsEditOpen(false)
      setSelectedCat(null)
      toast.success("Category updated successfully")
    },
    onError: () => toast.error("Failed to update category"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => articleService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-categories"] })
      toast.success("Category deleted successfully")
    },
    onError: () => toast.error("Failed to delete category"),
  })

  const handleCreate = () => {
    if (!newCatName.trim()) return
    createMutation.mutate(newCatName.trim())
  }

  const handleUpdate = () => {
    if (!selectedCat || !newCatName.trim()) return
    updateMutation.mutate({ id: selectedCat.id, name: newCatName.trim() })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            Article Categories
        </h3>
        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="rounded-full shadow-lg">
          <Plus className="w-4 h-4 mr-1" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : categories.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 border border-dashed rounded-xl ">
              <p className="text-muted-foreground italic">No categories yet.</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="font-bold text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.articleCount ?? 0} articles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                        className="font-medium cursor-pointer"
                        onClick={() => {
                            setSelectedCat(cat)
                            setNewCatName(cat.name)
                            setIsEditOpen(true)
                        }}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Rename Category
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="font-medium text-destructive cursor-pointer hover:!text-destructive"
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete "${cat.name}"? This might affect articles in this category.`)) {
                                deleteMutation.mutate(cat.id)
                            }
                        }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Category</DialogTitle>
            <DialogDescription>Add a new category to group your help articles.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
                placeholder="Category Name" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)} 
                className="rounded-xl h-11"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="rounded-xl px-6">
                {createMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Category</DialogTitle>
            <DialogDescription>Update the category name.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
                placeholder="Category Name" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)} 
                className="rounded-xl h-11"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="rounded-xl px-6">
                {updateMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Settings2 className="w-4 h-4 mr-2" />}
                Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
