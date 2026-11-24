import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useGrantSmsCredits, useUserSmsCredits } from "@/hooks/useSmsCredits"
import { SmsCreditsApiError } from "@/services/sms-credits-service"

const MAX_CREDITS = 100000
const MAX_REASON = 200

const grantSchema = z.object({
  credits: z
    .number({ error: "Enter a whole number of credits" })
    .int("Credits must be a whole number")
    .min(1, "Grant at least 1 credit")
    .max(MAX_CREDITS, `Cannot grant more than ${MAX_CREDITS.toLocaleString()} credits at once`),
  reason: z.string().trim().max(MAX_REASON, `Reason must be ${MAX_REASON} characters or fewer`).optional(),
})

type GrantFormValues = z.infer<typeof grantSchema>

export interface SmsCreditsUser {
  userId: number
  ownerName: string
  email: string
}

const fmt = (n: number) => n.toLocaleString()

function clearTokenCookie() {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

export function SmsCreditsModal({
  user,
  open,
  onOpenChange,
}: {
  user: SmsCreditsUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const creditsQuery = useUserSmsCredits(user.userId, open)
  const grantMutation = useGrantSmsCredits(user.userId)

  const form = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema),
    defaultValues: { credits: undefined, reason: "" },
  })

  /** Handles 401/403/404. Returns true when the error was fully handled. */
  const handleCommonError = (err: unknown): boolean => {
    if (!(err instanceof SmsCreditsApiError)) return false
    if (err.status === 401) {
      toast.error("Your session has expired. Please sign in again.")
      clearTokenCookie()
      navigate("/login", { replace: true })
      return true
    }
    if (err.status === 403) {
      toast.error("Only super admins can manage SMS credits.")
      onOpenChange(false)
      return true
    }
    if (err.status === 404) {
      toast.error(err.message || "User not found")
      onOpenChange(false)
      return true
    }
    return false
  }

  // Redirect / close when the balance load fails with an auth or not-found error
  const loadError = creditsQuery.error
  useEffect(() => {
    if (loadError) handleCommonError(loadError)
    // Intentionally keyed on the error only: react once per new load failure
  }, [loadError])

  const onSubmit = (values: GrantFormValues) => {
    const reason = values.reason?.trim()
    grantMutation.mutate(
      { credits: values.credits, ...(reason ? { reason } : {}) },
      {
        onSuccess: (data) => {
          toast.success(`Granted ${fmt(values.credits)} credits. New balance: ${fmt(data.smsCredits)}`)
          form.reset({ credits: undefined, reason: "" })
        },
        onError: (err) => {
          if (handleCommonError(err)) return
          if (err instanceof SmsCreditsApiError && err.status === 400) {
            const { fieldErrors } = err
            let placed = false
            if (fieldErrors.credits) {
              form.setError("credits", { message: fieldErrors.credits })
              placed = true
            }
            if (fieldErrors.reason) {
              form.setError("reason", { message: fieldErrors.reason })
              placed = true
            }
            if (!placed) {
              // No field mapping in the response; attach to the most likely field
              const target = /reason/i.test(err.message) ? "reason" : "credits"
              form.setError(target, { message: err.message })
            }
            return
          }
          toast.error(err instanceof Error ? err.message : "Failed to grant SMS credits")
        },
      },
    )
  }

  const isGranting = grantMutation.isPending
  const data = creditsQuery.data

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!isGranting) onOpenChange(next) }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>SMS Credits</DialogTitle>
          <DialogDescription>
            Manage SMS credits for <strong>{user.ownerName}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>

        {/* Balance card */}
        <div className="border border-border rounded-md p-4 bg-muted/20" aria-live="polite">
          {creditsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-32" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            </div>
          ) : creditsQuery.isError || !data ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-destructive">
                {creditsQuery.error instanceof Error ? creditsQuery.error.message : "Failed to load SMS credits"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => creditsQuery.refetch()}
                disabled={creditsQuery.isFetching}
              >
                {creditsQuery.isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Available credits
                </span>
                <p className="text-3xl font-bold tabular-nums leading-tight">{fmt(data.smsCredits)}</p>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Topped up</dt>
                  <dd className="font-medium tabular-nums">{fmt(data.totalToppedUp)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Used</dt>
                  <dd className="font-medium tabular-nums">{fmt(data.totalDebited)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Refunded</dt>
                  <dd className="font-medium tabular-nums">{fmt(data.totalRefunded)}</dd>
                </div>
              </dl>
              {data.asOf && (
                <p className="text-[10px] text-muted-foreground">
                  As of {format(new Date(data.asOf), "PPP p")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Grant form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits to grant</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_CREDITS}
                      step={1}
                      placeholder="e.g. 500"
                      disabled={isGranting}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      maxLength={MAX_REASON}
                      placeholder="e.g. Goodwill credit for delivery issue"
                      disabled={isGranting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isGranting}>
                Close
              </Button>
              <Button type="submit" disabled={isGranting}>
                {isGranting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Granting...
                  </>
                ) : (
                  "Grant credits"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SmsCreditsModal
