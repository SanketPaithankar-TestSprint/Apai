import { SupportAuditLog, AuditLogFilters, TargetType, AuditAction } from '@/types/audit-logs';

class AuditLogsService {
  private baseUrl = '/api/audit-logs';

  async getAuditLogs(filters?: AuditLogFilters): Promise<SupportAuditLog[]> {
    const params = new URLSearchParams();
    
    if (filters?.targetTypes?.length) {
      params.append('targetTypes', filters.targetTypes.join(','));
    }
    if (filters?.actions?.length) {
      params.append('actions', filters.actions.join(','));
    }
    if (filters?.agentIds?.length) {
      params.append('agentIds', filters.agentIds.join(','));
    }
    if (filters?.dateRange) {
      params.append('from', filters.dateRange.from);
      params.append('to', filters.dateRange.to);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }
    
    return response.json();
  }

  async getAuditLogById(id: string): Promise<SupportAuditLog> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch audit log');
    }
    
    return response.json();
  }

  async createAuditLog(log: Omit<SupportAuditLog, 'id' | 'timestamp'>): Promise<SupportAuditLog> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create audit log');
    }
    
    return response.json();
  }

  async getAuditLogsByTarget(targetType: TargetType, targetId: string): Promise<SupportAuditLog[]> {
    return this.getAuditLogs({
      targetTypes: [targetType],
      search: targetId
    });
  }

  async getAuditLogsByAgent(agentId: string): Promise<SupportAuditLog[]> {
    return this.getAuditLogs({
      agentIds: [agentId]
    });
  }

  async getAuditLogsByDateRange(from: string, to: string): Promise<SupportAuditLog[]> {
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
      params.append('actions', filters.actions.join(','));
    }
    if (filters?.agentIds?.length) {
      params.append('agentIds', filters.agentIds.join(','));
    }
    if (filters?.dateRange) {
      params.append('from', filters.dateRange.from);
      params.append('to', filters.dateRange.to);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    params.append('export', 'true');

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to export audit logs');
    }
    
    return response.blob();
  }

  // Utility method to log an action
  async logAction(
    agentId: string,
    agentName: string,
    action: AuditAction,
    targetType: TargetType,
    targetId: string,
    oldValue: Record<string, any> | null = null,
    newValue: Record<string, any> | null = null
  ): Promise<SupportAuditLog> {
    return this.createAuditLog({
      agentId,
      agentName,
      action,
      targetType,
      targetId,
      oldValue,
      newValue
    });
  }
}

export const auditLogsService = new AuditLogsService();
