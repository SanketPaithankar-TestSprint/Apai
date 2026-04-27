export interface SupportAuditLog {
  id: string;
  agentId: string | number;
  agentName?: string;
  action: AuditAction | string;
  targetType?: TargetType | string;
  targetId: string;
  oldValue?: Record<string, any> | string | null;
  newValue?: Record<string, any> | string | null;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export const TARGET_TYPES = {
  TICKET: 'TICKET',
  ARTICLE: 'ARTICLE',
  BLOG: 'BLOG',
  USER: 'USER',
  AGENT: 'AGENT',
  ENQUIRY: 'ENQUIRY',
  CATEGORY: 'CATEGORY',
  TAG: 'TAG'
} as const;

export type TargetType = typeof TARGET_TYPES[keyof typeof TARGET_TYPES];

export enum AuditAction {
  // Ticket Actions
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_UPDATED = 'TICKET_UPDATED',
  TICKET_DELETED = 'TICKET_DELETED',
  TICKET_STATUS_CHANGE = 'TICKET_STATUS_CHANGE',
  TICKET_PRIORITY_CHANGE = 'TICKET_PRIORITY_CHANGE',
  TICKET_CATEGORY_CHANGE = 'TICKET_CATEGORY_CHANGE',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  TICKET_UNASSIGNED = 'TICKET_UNASSIGNED',
  TICKET_MERGE = 'TICKET_MERGE',
  TICKET_SPLIT = 'TICKET_SPLIT',
  TICKET_NOTE_ADDED = 'TICKET_NOTE_ADDED',
  TICKET_ATTACHMENT_ADDED = 'TICKET_ATTACHMENT_ADDED',
  TICKET_ATTACHMENT_REMOVED = 'TICKET_ATTACHMENT_REMOVED',
  
  // Article Actions
  ARTICLE_CREATED = 'ARTICLE_CREATED',
  ARTICLE_UPDATED = 'ARTICLE_UPDATED',
  ARTICLE_DELETED = 'ARTICLE_DELETED',
  ARTICLE_VIEWED = 'ARTICLE_VIEWED',
  ARTICLE_PUBLISHED = 'ARTICLE_PUBLISHED',
  ARTICLE_ARCHIVED = 'ARTICLE_ARCHIVED',
  ARTICLE_CATEGORY_CHANGE = 'ARTICLE_CATEGORY_CHANGE',
  ARTICLE_TAG_ADDED = 'ARTICLE_TAG_ADDED',
  ARTICLE_TAG_REMOVED = 'ARTICLE_TAG_REMOVED',
  
  // Blog Actions
  BLOG_CREATED = 'BLOG_CREATED',
  BLOG_UPDATED = 'BLOG_UPDATED',
  BLOG_DELETED = 'BLOG_DELETED',
  BLOG_VIEWED = 'BLOG_VIEWED',
  
  // User Actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
  USER_STATUS_CHANGE = 'USER_STATUS_CHANGE',
  USER_PASSWORD_RESET = 'USER_PASSWORD_RESET',
  
  // Agent Actions
  AGENT_CREATED = 'AGENT_CREATED',
  AGENT_UPDATED = 'AGENT_UPDATED',
  AGENT_DELETED = 'AGENT_DELETED',
  AGENT_STATUS_CHANGE = 'AGENT_STATUS_CHANGE',
  AGENT_DEPARTMENT_CHANGE = 'AGENT_DEPARTMENT_CHANGE',
  
  // Enquiry Actions
  ENQUIRY_CREATED = 'ENQUIRY_CREATED',
  ENQUIRY_UPDATED = 'ENQUIRY_UPDATED',
  ENQUIRY_DELETED = 'ENQUIRY_DELETED',
  ENQUIRY_STATUS_CHANGE = 'ENQUIRY_STATUS_CHANGE',
  ENQUIRY_ASSIGNED = 'ENQUIRY_ASSIGNED',
  
  // Category Actions
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',
  
  // Tag Actions
  TAG_CREATED = 'TAG_CREATED',
  TAG_UPDATED = 'TAG_UPDATED',
  TAG_DELETED = 'TAG_DELETED',
  
  // System Actions
  AGENT_LOGIN = 'AGENT_LOGIN',
  AGENT_LOGOUT = 'AGENT_LOGOUT',
  SYSTEM_BACKUP = 'SYSTEM_BACKUP',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  BULK_OPERATION = 'BULK_OPERATION'
}

export const AUDIT_ACTION_GROUPS = {
  TICKET_MANAGEMENT: [
    AuditAction.TICKET_CREATED,
    AuditAction.TICKET_UPDATED,
    AuditAction.TICKET_DELETED,
    AuditAction.TICKET_STATUS_CHANGE,
    AuditAction.TICKET_PRIORITY_CHANGE,
    AuditAction.TICKET_CATEGORY_CHANGE,
    AuditAction.TICKET_ASSIGNED,
    AuditAction.TICKET_UNASSIGNED,
    AuditAction.TICKET_MERGE,
    AuditAction.TICKET_SPLIT,
    AuditAction.TICKET_NOTE_ADDED,
    AuditAction.TICKET_ATTACHMENT_ADDED,
    AuditAction.TICKET_ATTACHMENT_REMOVED
  ],
  ARTICLE_MANAGEMENT: [
    AuditAction.ARTICLE_CREATED,
    AuditAction.ARTICLE_UPDATED,
    AuditAction.ARTICLE_DELETED,
    AuditAction.ARTICLE_VIEWED,
    AuditAction.ARTICLE_PUBLISHED,
    AuditAction.ARTICLE_ARCHIVED,
    AuditAction.ARTICLE_CATEGORY_CHANGE,
    AuditAction.ARTICLE_TAG_ADDED,
    AuditAction.ARTICLE_TAG_REMOVED
  ],
  BLOG_MANAGEMENT: [
    AuditAction.BLOG_CREATED,
    AuditAction.BLOG_UPDATED,
    AuditAction.BLOG_DELETED,
    AuditAction.BLOG_VIEWED
  ],
  USER_MANAGEMENT: [
    AuditAction.USER_CREATED,
    AuditAction.USER_UPDATED,
    AuditAction.USER_DELETED,
    AuditAction.USER_ROLE_CHANGE,
    AuditAction.USER_STATUS_CHANGE,
    AuditAction.USER_PASSWORD_RESET
  ],
  AGENT_MANAGEMENT: [
    AuditAction.AGENT_CREATED,
    AuditAction.AGENT_UPDATED,
    AuditAction.AGENT_DELETED,
    AuditAction.AGENT_STATUS_CHANGE,
    AuditAction.AGENT_DEPARTMENT_CHANGE
  ],
  SYSTEM_OPERATIONS: [
    AuditAction.AGENT_LOGIN,
    AuditAction.AGENT_LOGOUT,
    AuditAction.SYSTEM_BACKUP,
    AuditAction.SYSTEM_MAINTENANCE,
    AuditAction.BULK_OPERATION
  ]
} as const;

export interface AuditLogFilters {
  targetTypes?: TargetType[];
  actions?: AuditAction[] | string[];
  agentIds?: string[] | number[];
  targetId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
  page?: number;
  limit?: number;
}
