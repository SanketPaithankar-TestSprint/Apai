import { API_ENDPOINTS } from "@/constants/api"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { 
  HelpArticle, 
  HelpCategory, 
  ArticlesResponse, 
  CreateArticleDto, 
  UpdateArticleDto,
  GetArticlesParams
} from "@/types/article"

export const articleService = {
  // Articles
  getArticles: async (params: GetArticlesParams = {}): Promise<ArticlesResponse> => {
    const queryParams = new URLSearchParams()
    if (params.categoryId !== undefined) queryParams.append("categoryId", params.categoryId.toString())
    if (params.search) queryParams.append("search", params.search)
    if (params.archived !== undefined) queryParams.append("archived", params.archived.toString())
    if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.endDate) queryParams.append("endDate", params.endDate)
    queryParams.append("page", (params.page || 0).toString())
    queryParams.append("limit", (params.limit || 10).toString())

    const response = await fetchWithAuth(`${API_ENDPOINTS.ADMIN_ARTICLES}?${queryParams.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch articles")
    return response.json()
  },

  getArticle: async (id: string): Promise<HelpArticle> => {
    const response = await fetchWithAuth(API_ENDPOINTS.SUPPORT_ARTICLE(id))
    if (!response.ok) throw new Error("Failed to fetch article details")
    return response.json()
  },

  createArticle: async (article: CreateArticleDto): Promise<HelpArticle> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_ARTICLES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    })
    if (!response.ok) throw new Error("Failed to create article")
    return response.json()
  },

  updateArticle: async (id: string, article: UpdateArticleDto): Promise<HelpArticle> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_ARTICLE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    })
    if (!response.ok) throw new Error("Failed to update article")
    return response.json()
  },

  deleteArticle: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_ARTICLE(id), {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete article")
    if (response.status === 204) return { success: true }
    try {
      return await response.json()
    } catch {
      return { success: true }
    }
  },

  // Categories
  getCategories: async (): Promise<HelpCategory[]> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_CATEGORIES)
    if (!response.ok) throw new Error("Failed to fetch categories")
    return response.json()
  },

  createCategory: async (name: string): Promise<HelpCategory> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_CATEGORIES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error("Failed to create category")
    return response.json()
  },

  updateCategory: async (id: number, name: string): Promise<HelpCategory> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_CATEGORY(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error("Failed to update category")
    return response.json()
  },

  deleteCategory: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_CATEGORY(id), {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete category")
    if (response.status === 204) return { success: true }
    try {
      return await response.json()
    } catch {
      return { success: true }
    }
  },
}
