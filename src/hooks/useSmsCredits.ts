import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { smsCreditsService } from "@/services/sms-credits-service"
import type { GrantSmsCreditsRequest } from "@/types/sms-credits"

export const smsCreditsKeys = {
  user: (userId: number) => ["sms-credits", userId] as const,
}

export function useUserSmsCredits(userId: number, enabled: boolean) {
  return useQuery({
    queryKey: smsCreditsKeys.user(userId),
    queryFn: () => smsCreditsService.getUserSmsCredits(userId),
    enabled,
    staleTime: 0,
    retry: false,
  })
}

export function useGrantSmsCredits(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: GrantSmsCreditsRequest) => smsCreditsService.grantUserSmsCredits(userId, body),
    onSuccess: (data) => {
      // POST returns the fresh balance; no refetch needed
      queryClient.setQueryData(smsCreditsKeys.user(userId), data)
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] })
    },
  })
}
