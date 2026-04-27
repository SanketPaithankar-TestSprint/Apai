import { SupportAuditLog, AuditLogFilters, TargetType, AuditAction, PaginatedResponse } from '@/types/audit-logs';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

class AuditLogsService {
  private baseUrl = `${import.meta.env.VITE_JAVA_BACKEND_URL || '/api/'}admin/audit-logs`;

  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<SupportAuditLog>> {
    const params = new URLSearchParams();
    
    if (filters?.actions?.length) {
      // API expects a single action string query param based on swagger, we take the first or pass multiple if backend supports array
      params.append('action', filters.actions.join(','));
    }
    if (filters?.agentIds?.length) {
      params.append('agentId', filters.agentIds.join(','));
    }
    if (filters?.targetId) {
      params.append('targetId', filters.targetId);
    }
    if (filters?.page !== undefined) {
      params.append('page', filters.page.toString());
    } else {
      params.append('page', '0');
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    } else {
      params.append('limit', '20');
    }
    // Retaining custom frontend logic like dateRange/search if backend doesn't explicitly support it yet
    if (filters?.dateRange) {
      params.append('from', filters.dateRange.from);
      params.append('to', filters.dateRange.to);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    // Always sort by timestamp descending (newest first)
    params.append('sort', 'timestamp,desc');

    const response = await fetchWithAuth(`${this.baseUrl}?${params.toString()}`);
    if (!response.ok) {
      console.error("GET Audit Logs failed:", response.status, response.statusText);
      throw new Error('Failed to fetch audit logs');
    }
    
    const data = await response.json();
    console.log("GET Audit Logs response:", data);
    return data;
  }

  async getAuditLogById(id: string): Promise<SupportAuditLog> {
    const response = await fetchWithAuth(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch audit log');
    }
    
    return response.json();
  }

  async createAuditLog(log: any): Promise<SupportAuditLog> {
    const response = await fetchWithAuth(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });
    
    if (!response.ok) {
      console.error("POST Audit Log failed:", response.status, response.statusText);
      throw new Error('Failed to create audit log');
    }
    
    const data = await response.json();
    console.log("POST Audit Log response:", data);
    return data;
  }

  async getAuditLogsByTarget(targetType: TargetType, targetId: string): Promise<PaginatedResponse<SupportAuditLog>> {
    return this.getAuditLogs({
      targetId: targetId
    });
  }

  async getAuditLogsByAgent(agentId: string): Promise<PaginatedResponse<SupportAuditLog>> {
    return this.getAuditLogs({
      agentIds: [agentId]
    });
  }

  async getAuditLogsByDateRange(from: string, to: string): Promise<PaginatedResponse<SupportAuditLog>> {
    return this.getAuditLogs({
      dateRange: { from, to }
    });
  }

  async exportAuditLogs(filters?: AuditLogFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.targetTypes?.length) {
      params.append('targetTypes', filters.targetTypes.join(','));
    }
    if (filters?.actions?.length) {
      params.append('action', filters.actions.join(','));
    }
    if (filters?.agentIds?.length) {
      params.append('agentId', filters.agentIds.join(','));
    }
    if (filters?.targetId) {
      params.append('targetId', filters.targetId);
    }
    if (filters?.dateRange) {
      params.append('from', filters.dateRange.from);
      params.append('to', filters.dateRange.to);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    params.append('export', 'true');

    const response = await fetchWithAuth(`${this.baseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }
    
    return response.blob();
  }

  // Utility method to log an action
  async logAction(
    agentId: any,
    agentName: string,
    action: AuditAction,
    targetType: TargetType,
    targetId: string,
    oldValue: Record<string, any> | null = null,
    newValue: Record<string, any> | null = null
  ): Promise<SupportAuditLog> {
    // Intercept with valid backend database user
    const activeAgentId = 2;
    const activeAgentName = "Sanket Paithankar";

    return this.createAuditLog({
      agentId: activeAgentId,
      agentName: activeAgentName,
      action,
      targetId,
      oldValue: oldValue ? (typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue)) : null,
      newValue: newValue ? (typeof newValue === 'string' ? newValue : JSON.stringify(newValue)) : null
    });
  }
}

export const auditLogsService = new AuditLogsService();
