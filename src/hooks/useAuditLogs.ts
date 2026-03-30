import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportAuditLog, AuditLogFilters, TargetType, AuditAction } from '@/types/audit-logs';
import { auditLogsService } from '@/services/auditLogsService';

export function useAuditLogs(filters?: AuditLogFilters) {
  const queryClient = useQueryClient();

  const {
    data: auditLogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditLogsService.getAuditLogs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createLogMutation = useMutation({
    mutationFn: auditLogsService.createAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  const exportLogsMutation = useMutation({
    mutationFn: auditLogsService.exportAuditLogs,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });

  const logAction = useCallback(async (
    agentId: string,
    agentName: string,
    action: AuditAction,
    targetType: TargetType,
    targetId: string,
    oldValue: Record<string, any> | null = null,
    newValue: Record<string, any> | null = null
  ) => {
    return createLogMutation.mutateAsync({
      agentId,
      agentName,
      action,
      targetType,
      targetId,
      oldValue: oldValue || null,
      newValue: newValue || null
    });
  }, [createLogMutation]);

  const exportLogs = useCallback((exportFilters?: AuditLogFilters) => {
    return exportLogsMutation.mutateAsync(exportFilters || filters);
  }, [exportLogsMutation, filters]);

  return {
    auditLogs,
    isLoading,
    error,
    refetch,
    logAction,
    exportLogs,
    isExporting: exportLogsMutation.isPending,
    isLogging: createLogMutation.isPending
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
    data: auditLogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['target-audit-logs', targetType, targetId],
    queryFn: () => auditLogsService.getAuditLogsByTarget(targetType, targetId),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    auditLogs,
    isLoading,
    error,
    refetch
  };
}

export function useAgentAuditLogs(agentId: string) {
  const {
    data: auditLogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-audit-logs', agentId],
    queryFn: () => auditLogsService.getAuditLogsByAgent(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    auditLogs,
    isLoading,
    error,
    refetch
  };
}
