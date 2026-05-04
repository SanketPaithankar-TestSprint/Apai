import { useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportAuditLog, AuditLogFilters, TargetType, AuditAction } from '@/types/audit-logs';
import { auditLogsService } from '@/services/auditLogsService';

export function useAuditLogs(filters?: AuditLogFilters) {
  const queryClient = useQueryClient();

  const {
    data: paginatedData,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['audit-logs', filters],
    queryFn: ({ pageParam }) => auditLogsService.getAuditLogs({ ...filters, page: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.number ?? 0;
      const totalPages = lastPage.totalPages ?? 1;
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });



  const exportLogsMutation = useMutation({
    mutationFn: async (logsToExport: SupportAuditLog[]) => {
      // Create a formatted log string
      const logContent = logsToExport.map(log => {
        const timestamp = new Date(log.timestamp).toISOString();
        const agent = log.agentName || 'System';
        const action = log.action;
        const target = `${log.targetType || 'UNKNOWN'}:${log.targetId}`;
        const oldVal = log.oldValue ? `[OLD: ${typeof log.oldValue === 'string' ? log.oldValue : JSON.stringify(log.oldValue)}]` : '';
        const newVal = log.newValue ? `[NEW: ${typeof log.newValue === 'string' ? log.newValue : JSON.stringify(log.newValue)}]` : '';
        
        return `[${timestamp}] ${agent} performed ${action} on ${target} ${oldVal} ${newVal}`.trim();
      }).join('\n');

      return new Blob([logContent], { type: 'text/plain' });
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.log`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });



  let auditLogs = (paginatedData?.pages.flatMap((page) => page.content) || []).sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  if (filters) {
    if (filters.targetTypes?.length) {
      auditLogs = auditLogs.filter(log => {
        // Since backend might omit targetType in payload, infer it from action (e.g. USER_UPDATED -> USER)
        const targetType = log.targetType || (typeof log.action === 'string' ? log.action.split('_')[0] : '');
        return filters.targetTypes!.includes(targetType as TargetType);
      });
    }
    if (filters.actions?.length) {
      auditLogs = auditLogs.filter(log => filters.actions!.includes(log.action as AuditAction));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      auditLogs = auditLogs.filter(log => 
        log.agentName?.toLowerCase().includes(searchLower) ||
        (typeof log.action === 'string' && log.action.toLowerCase().includes(searchLower)) ||
        String(log.targetId).toLowerCase().includes(searchLower)
      );
    }
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const fromTime = new Date(filters.dateRange.from).setHours(0,0,0,0);
      const toTime = new Date(filters.dateRange.to).setHours(23,59,59,999);
      auditLogs = auditLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= fromTime && logTime <= toTime;
      });
    }
  }

  const exportLogs = useCallback(() => {
    return exportLogsMutation.mutateAsync(auditLogs);
  }, [exportLogsMutation, auditLogs]);

  return {
    auditLogs,
    isLoading,
    error,
    refetch,
    exportLogs,
    isExporting: exportLogsMutation.isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}

export function useAuditLog(id: string) {
  const {
    data: auditLog,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => auditLogsService.getAuditLogById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    auditLog,
    isLoading,
    error,
    refetch
  };
}

export function useTargetAuditLogs(targetType: TargetType, targetId: string) {
  const {
    data: paginatedData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['target-audit-logs', targetType, targetId],
    queryFn: () => auditLogsService.getAuditLogsByTarget(targetType, targetId),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const auditLogs = paginatedData?.content || [];

  return {
    auditLogs,
    isLoading,
    error,
    refetch
  };
}

export function useAgentAuditLogs(agentId: string) {
  const {
    data: paginatedData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-audit-logs', agentId],
    queryFn: () => auditLogsService.getAuditLogsByAgent(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const auditLogs = paginatedData?.content || [];

  return {
    auditLogs,
    isLoading,
    error,
    refetch
  };
}
