export interface HelpCategory {
  id: number
  name: string
  articleCount?: number
}

export interface HelpArticle {
  id: string
  title: string
  description: string
  content?: string
  categoryId: number
  categoryName?: string
  lastUpdated?: string
  published: boolean
  archived: boolean
}

export interface ArticlesResponse {
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  number: number
  size: number
  numberOfElements: number
  empty: boolean
  content: HelpArticle[]
}

export interface CreateArticleDto {
  title: string
  description: string
  categoryId: number
  content: string
  published: boolean
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface GetArticlesParams {
  categoryId?: number
  search?: string
  page?: number
  limit?: number
  archived?: boolean
  startDate?: string
  endDate?: string
}
