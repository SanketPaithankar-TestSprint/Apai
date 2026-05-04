"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { MoreVertical, Plus, FileText, Loader2, Search, X, Users, Eye, Filter, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { type DateRange } from "react-day-picker"

import { EmptyState } from "@/components/EmptyState"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { API_ENDPOINTS } from "@/constants/api"

interface User {
  userId: number
  email: string
  ownerName: string
  phone: string | null
  alternatePhone: string | null
  businessName: string | null
  isActive: boolean
  isOnline: boolean
  isDeveloper: boolean | null
  lastActivity: string | null
  subscriptionStatus: string | null
  subscriptionPlan: string | null
  subscriptionExpiryDate: string | null
  userType?: string | null
  createdAt: string | null
}

function EditSubscriptionModal({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState(user.subscriptionStatus || "ACTIVE")
  const [plan, setPlan] = useState(user.subscriptionPlan || "BASIC")
  const [userType, setUserType] = useState(user.userType || "SHOP_OWNER")
  const [durationMonths, setDurationMonths] = useState("1")
  const [durationDays, setDurationDays] = useState("0")


  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_USER_SUBSCRIPTION(user.userId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          plan,
          userType,
          durationMonths: parseInt(durationMonths) || 0,
          durationDays: parseInt(durationDays) || 0,
        }),
      })
      if (!response.ok) throw new Error("Failed to update subscription")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Subscription updated successfully")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to update subscription")
    },
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_USER_SUBSCRIPTION(user.userId), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error("Failed to clear subscription")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Subscription cleared successfully")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to clear subscription")
    },
  })

  const isSubmitting = updateMutation.isPending || clearMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update subscription for <strong>{user.ownerName}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Plan</label>
            <Select value={plan} onValueChange={setPlan} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEST">Test</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">User Type</label>
            <Select value={userType} onValueChange={setUserType} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOBILE_TECHNICIAN">Mobile Technician</SelectItem>
                <SelectItem value="SHOP_OWNER">Shop Owner</SelectItem>
                <SelectItem value="TINT">Tint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Duration (Months)</label>
              <Input
                type="number"
                min="0"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                disabled={isSubmitting}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Duration (Days)</label>
              <Input
                type="number"
                min="0"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                disabled={isSubmitting}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => clearMutation.mutate()}
            disabled={isSubmitting}
            className="mr-auto"
          >
            {clearMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Clearing...
              </>
            ) : (
              "Clear Subscription"
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => updateMutation.mutate()} disabled={isSubmitting}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateTestAccountModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [businessName, setBusinessName] = useState("")

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_CREATE_TEST_ACCOUNT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ownerName: name,
          phone,
          businessName,
        }),
      })
      if (!response.ok) throw new Error("Failed to create test account")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Test account created successfully")
      setEmail("")
      setPassword("")
      setName("")
      setPhone("")
      setBusinessName("")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to create test account")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Test Account</DialogTitle>
          <DialogDescription>
            Create a dummy test user with ACTIVE status and TEST subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test User"
              disabled={createMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Business Name</label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Test Business"
              disabled={createMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              disabled={createMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5551234567"
              disabled={createMutation.isPending}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={createMutation.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending || !email || !password || !name || !phone || !businessName
            }
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Test Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ViewUserDetailsModal({
  user,
  open,
  onOpenChange,
  onEdit,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (user: User) => void
}) {
  const detailItem = (label: string, value: any, colSpan = 1) => (
    <div className={cn(
      "flex flex-col gap-1 p-3.5 border border-border/60 rounded-md bg-muted/5",
      colSpan === 2 ? "md:col-span-2" : colSpan === 3 ? "lg:col-span-3" : ""
    )}>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[13px] font-medium text-foreground break-words leading-snug">
        {value === null || value === undefined ? "N/A" : typeof value === 'boolean' ? (value ? "Yes" : "No") : String(value)}
      </span>
    </div>
  )

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A"
    try {
      return format(new Date(dateStr), "PPP p")
    } catch (e) {
      return dateStr
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Full profile and system details for <strong>{user.ownerName || "Unknown User"}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {/* Primary Info */}
          {detailItem("User ID", user.userId)}
          {detailItem("Email Address", user.email, 2)}
          {detailItem("Owner Name", user.ownerName)}
          {detailItem("Business Name", user.businessName, 2)}
          
          {/* Contact */}
          {detailItem("Phone Number", user.phone)}
          {detailItem("Alternate Phone", user.alternatePhone)}
          
          {/* Status */}
          {detailItem("Account Active", user.isActive)}
          {detailItem("Currently Online", user.isOnline)}
          {detailItem("Developer Status", user.isDeveloper)}
          
          {/* Subscription */}
          {detailItem("Plan Type", user.subscriptionPlan)}
          {detailItem("Subscription Status", user.subscriptionStatus)}
          {detailItem("Expiry Date", formatDate(user.subscriptionExpiryDate))}
          
          {/* Activity */}
          {detailItem("Created At", formatDate(user.createdAt), 2)}
          {detailItem("Last Activity", formatDate(user.lastActivity), 1)}
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => {
            onOpenChange(false)
            onEdit(user)
          }}>
            Edit Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UsersFilterModal({
  open,
  onOpenChange,
  filters,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: any
  onApply: (filters: any) => void
}) {
  const [localFilters, setLocalFilters] = useState(filters)

  // Sync local filters when the modal opens with fresh data
  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleReset = () => {
    const reset = {
      subscriptionStatus: "all",
      subscriptionPlan: "all",
      userType: "all",
      isActive: "all",
      dateRange: { from: undefined, to: undefined } as DateRange
    }
    setLocalFilters(reset)
    onApply(reset)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Users</DialogTitle>
          <DialogDescription>
            Narrow down the user list based on their status, plan, type, or creation date.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Created Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dateRange?.from ? (
                    localFilters.dateRange.to ? (
                      <>
                        {format(localFilters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(localFilters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(localFilters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={localFilters.dateRange?.from}
                  selected={localFilters.dateRange}
                  onSelect={(v) => setLocalFilters({ ...localFilters, dateRange: v })}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Subscription Status</label>
            <Select
              value={localFilters.subscriptionStatus}
              onValueChange={(v) => setLocalFilters({ ...localFilters, subscriptionStatus: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PAST_DUE">Past Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Subscription Plan</label>
            <Select
              value={localFilters.subscriptionPlan}
              onValueChange={(v) => setLocalFilters({ ...localFilters, subscriptionPlan: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="TEST">Test</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">User Type</label>
            <Select
              value={localFilters.userType}
              onValueChange={(v) => setLocalFilters({ ...localFilters, userType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MOBILE_TECHNICIAN">Mobile Technician</SelectItem>
                <SelectItem value="SHOP_OWNER">Shop Owner</SelectItem>
                <SelectItem value="TINT">Tint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Account Status</label>
            <Select
              value={localFilters.isActive}
              onValueChange={(v) => setLocalFilters({ ...localFilters, isActive: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active Accounts</SelectItem>
                <SelectItem value="not_active">Inactive Accounts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <Button variant="ghost" onClick={handleReset} className="px-0">
            Reset All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onApply(localFilters)
              onOpenChange(false)
            }}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UsersPage() {

  const queryClient = useQueryClient()
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    subscriptionStatus: "all",
    subscriptionPlan: "all",
    userType: "all",
    isActive: "all",
    dateRange: { from: undefined, to: undefined } as DateRange
  })

  // Ensure useEffect is imported or use it from React
  useEffect(() => {
    // If we need any side effects on filter change
  }, [activeFilters])

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_USERS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      const usersList = Array.isArray(data) ? data : data.data || data.users || []
      return usersList as User[]
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_USER_STATUS(userId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to toggle user status")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTogglingUserId(null)
    },
    onError: (error) => {
      console.error("Error toggling status:", error)
      toast.error("Failed to toggle user status")
      setTogglingUserId(null)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetchWithAuth(API_ENDPOINTS.ADMIN_USER_DELETE(userId), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User and all associated data deleted successfully")
      setDeleteUser(null)
    },
    onError: () => {
      toast.error("Failed to delete user")
      setDeleteUser(null)
    },
  })

  const handleViewLicense = async (userId: number) => {
    const url = API_ENDPOINTS.ADMIN_USER_BUSINESS_LICENSE(userId)
    window.open(url, "_blank")
  }

  // Filter both live and mock users
  const filterUser = (user: User) => {
    const query = searchQuery.toLowerCase()

    // Search filter
    const matchesSearch =
      user.ownerName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.userId?.toString().includes(query) ||
      user.businessName?.toLowerCase().includes(query)

    if (!matchesSearch) return false

    // Status filter
    if (activeFilters.subscriptionStatus !== "all" && user.subscriptionStatus !== activeFilters.subscriptionStatus) return false

    // Plan filter
    if (activeFilters.subscriptionPlan !== "all" && user.subscriptionPlan !== activeFilters.subscriptionPlan) return false

    // User Type filter
    if (activeFilters.userType !== "all" && user.userType !== activeFilters.userType) return false

    // Active status filter
    if (activeFilters.isActive !== "all") {
      const targetActive = activeFilters.isActive === "active"
      if (user.isActive !== targetActive) return false
    }

    // Date range filter
    if (activeFilters.dateRange?.from && user.createdAt) {
      const createdDate = new Date(user.createdAt)
      const from = new Date(activeFilters.dateRange.from)
      from.setHours(0, 0, 0, 0)
      
      if (createdDate < from) return false
      
      if (activeFilters.dateRange.to) {
        const to = new Date(activeFilters.dateRange.to)
        to.setHours(23, 59, 59, 999)
        if (createdDate > to) return false
      }
    }

    return true
  }


  const dataUsers = users.length > 0 ? users : []

  const displayUsers = dataUsers.filter(filterUser)

  const regularUsers = displayUsers.filter(u => !u.isDeveloper)
  const developerUsers = displayUsers.filter(u => u.isDeveloper)

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1 border-b-2 border-black mb-4">
        <div className="flex items-center gap-6 flex-1">
          <h1 className="text-lg font-bold tracking-tight shrink-0">Users</h1>

          <div className="relative w-full max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 rounded-none border-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-none border-2 px-3"
            onClick={() => setShowFilters(true)}
          >
            <Filter className={`h-4 w-4 ${Object.values(activeFilters).some(v => v !== "all") ? "text-primary fill-primary" : ""}`} />
            <span className="ml-2 hidden sm:inline">Filters</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateTest(true)} size="sm" className="h-9 rounded-none font-bold text-xs uppercase">
            <Plus className="w-4 h-4 mr-2" />
            Generate Test User
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-none border border-destructive/20 mb-4">
          {error instanceof Error ? error.message : "Failed to load users"}
        </div>
      )}

      {!isLoading && (
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4 rounded-none border-b bg-transparent h-auto p-0 flex">
            <TabsTrigger
              value="users"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-6 py-2.5 font-bold uppercase tracking-wider text-xs flex-1 md:flex-none md:w-[200px]"
            >
              Users ({regularUsers.length})
            </TabsTrigger>
            <TabsTrigger
              value="developers"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-6 py-2.5 font-bold uppercase tracking-wider text-xs flex-1 md:flex-none md:w-[200px]"
            >
              Developers ({developerUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-0 outline-none">
            <UserSection
              title="Users"
              users={regularUsers}
              togglingUserId={togglingUserId}
              onEdit={setEditUser}
              onDelete={setDeleteUser}
              onViewUserDetails={setViewUser}
              onToggleStatus={(id) => {
                setTogglingUserId(id)
                toggleStatusMutation.mutate(id)
              }}
              onViewLicense={handleViewLicense}
              hideHeader
            />
          </TabsContent>

          <TabsContent value="developers" className="mt-0 outline-none">
            <UserSection
              title="Developers"
              users={developerUsers}
              togglingUserId={togglingUserId}
              onEdit={setEditUser}
              onDelete={setDeleteUser}
              onViewUserDetails={setViewUser}
              onToggleStatus={(id) => {
                setTogglingUserId(id)
                toggleStatusMutation.mutate(id)
              }}
              onViewLicense={handleViewLicense}
              hideHeader
            />
          </TabsContent>
        </Tabs>
      )}

      {viewUser && (
        <ViewUserDetailsModal
          user={viewUser}
          open={!!viewUser}
          onOpenChange={(open) => {
            if (!open) setViewUser(null)
          }}
          onEdit={setEditUser}
        />
      )}

      {editUser && (
        <EditSubscriptionModal
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => {
            if (!open) setEditUser(null)
          }}
        />
      )}

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteUser?.ownerName}</strong> ({deleteUser?.email}) and all associated data including Shops, Employees, Customers, and Documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteUser) {
                  deleteUserMutation.mutate(deleteUser.userId)
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateTestAccountModal open={showCreateTest} onOpenChange={setShowCreateTest} />

      <UsersFilterModal
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={activeFilters}
        onApply={setActiveFilters}
      />
    </div>
  )
}

function UserSection({
  title,
  users,
  togglingUserId,
  onEdit,
  onDelete,
  onViewUserDetails,
  onToggleStatus,
  onViewLicense,
  className = "",
  hideHeader,
}: {
  title: string
  users: User[]
  togglingUserId: number | null
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onViewUserDetails: (user: User) => void
  onToggleStatus: (userId: number) => void
  onViewLicense: (userId: number) => void
  className?: string
  hideHeader?: boolean
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {!hideHeader && (
        <div className="flex items-center gap-2 px-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {title} ({users.length})
          </h2>
        </div>
      )}

      <div className="mt-0 border border-border rounded-none overflow-x-auto shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Business Name</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Owner Name</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Email</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Phone</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Alt Phone</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Activity</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Plan</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">User Type</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Sub Status</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Expiry</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Created At</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Active</th>
              <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-0">
                  <EmptyState
                    title={`No ${title} Found`}
                    description={`We couldn't find any ${title.toLowerCase()} matching your current criteria or search query.`}
                    className="border-none bg-transparent py-10"
                  />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.userId}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td
                    className="px-3 py-2 font-medium truncate max-w-[150px]"
                    title={user.businessName && user.businessName !== "null" ? user.businessName : "N/A"}
                  >
                    {user.businessName && user.businessName !== "null" ? user.businessName : "N/A"}
                  </td>
                  <td className="px-3 py-2 truncate max-w-[120px]" title={user.ownerName || "N/A"}>
                    {user.ownerName || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground truncate max-w-[150px]" title={user.email || "N/A"}>
                    {user.email || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground truncate max-w-[100px]">
                    {user.phone || "N/A"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground truncate max-w-[100px]">
                    {user.alternatePhone || "N/A"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-0.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${user.isOnline
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                            : "bg-gray-300"
                            }`}
                        />
                        <span className={`font-medium ${user.isOnline ? "text-green-700" : "text-muted-foreground"}`}>
                          {user.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      {!user.isOnline && user.lastActivity && (
                        <span className="text-[9px] text-muted-foreground">
                          Last: {new Date(user.lastActivity).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{user.subscriptionPlan || "N/A"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 uppercase">
                      {user.userType?.replace("_", " ") || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${user.subscriptionStatus === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {user.subscriptionStatus || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {user.subscriptionExpiryDate
                      ? new Date(user.subscriptionExpiryDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-3 py-2">
                    {togglingUserId === user.userId ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-muted-foreground">...</span>
                      </div>
                    ) : (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                      >
                        {user.isActive ? "Active" : "Not Active"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewUserDetails(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View User Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          Edit Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewLicense(user.userId)}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Business License
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(user.userId)}>
                          {user.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(user)}>
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersPage

