"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { MoreVertical, Plus, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
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

interface User {
  userId: number
  email: string
  ownerName: string
  phone: string | null
  alternatePhone: string | null
  businessName: string | null
  isActive: boolean
  isOnline: boolean
  lastActivity: string | null
  subscriptionStatus: string | null
  subscriptionPlan: string | null
  subscriptionExpiryDate: string | null
  createdAt: string | null
}

// ─── Edit Subscription Modal ────────────────────────────────────────────────
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
  const [durationMonths, setDurationMonths] = useState("1")
  const [durationDays, setDurationDays] = useState("0")

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${user.userId}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          plan,
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
      const response = await fetch(`/api/admin/users/${user.userId}/subscription`, {
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={isSubmitting}
          >
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

// ─── Create Test Account Modal ──────────────────────────────────────────────
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
      const response = await fetch("/api/admin/users/test-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          ownerName: name,
          phone,
          businessName 
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
            disabled={createMutation.isPending || !email || !password || !name || !phone || !businessName}
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

// ─── Main Users Page ────────────────────────────────────────────────────────
export default function UsersPage() {
  const queryClient = useQueryClient()
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)

  // Modal states
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [showCreateTest, setShowCreateTest] = useState(false)

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
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
      return usersList
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
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
      const response = await fetch(`/api/admin/users/${userId}`, {
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

  const handleViewLicense = (userId: number) => {
    window.open(`/api/admin/users/${userId}/business-license`, "_blank")
  }

  const displayUsers =
    users.length > 0
      ? users
      : [
        {
          userId: 1,
          ownerName: "John Doe",
          email: "john@example.com",
          phone: "9876543210",
          alternatePhone: "9876543211",
          businessName: "Tech Solutions",
          isActive: true,
          isOnline: true,
          lastActivity: new Date().toISOString(),
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "Premium",
          subscriptionExpiryDate: "2026-12-31T23:59:59.999Z",
          createdAt: "2025-01-01T10:00:00.000Z",
        },
        {
          userId: 2,
          ownerName: "Jane Smith",
          email: "jane@example.com",
          phone: "9876543220",
          alternatePhone: "9876543221",
          businessName: "Creative Studio",
          isActive: true,
          isOnline: false,
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "Basic",
          subscriptionExpiryDate: "2026-08-31T23:59:59.999Z",
          createdAt: "2025-02-15T10:00:00.000Z",
        },
        {
          userId: 3,
          ownerName: "Bob Johnson",
          email: "bob@example.com",
          phone: "9876543230",
          alternatePhone: "9876543231",
          businessName: "Business Services",
          isActive: false,
          isOnline: false,
          lastActivity: "2025-12-01T10:00:00.000Z",
          subscriptionStatus: "INACTIVE",
          subscriptionPlan: "Standard",
          subscriptionExpiryDate: "2025-12-31T23:59:59.999Z",
          createdAt: "2024-12-01T10:00:00.000Z",
        },
      ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">Manage all users in your system</p>
        </div>
        <Button onClick={() => setShowCreateTest(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Test User
        </Button>
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
        <div className="border border-border rounded-none overflow-x-auto shadow-sm">
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
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Sub Status</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Expiry</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Created At</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Active</th>
                <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-6 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                displayUsers.map((user: User) => (
                  <tr key={user.userId} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 font-medium truncate max-w-[150px]" title={user.businessName && user.businessName !== "null" ? user.businessName : "N/A"}>
                      {user.businessName && user.businessName !== "null" ? user.businessName : "N/A"}
                    </td>
                    <td className="px-3 py-2 truncate max-w-[120px]" title={user.ownerName || "N/A"}>{user.ownerName || "N/A"}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[150px]" title={user.email || "N/A"}>{user.email || "N/A"}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[100px]">{user.phone || "N/A"}</td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-[100px]">{user.alternatePhone || "N/A"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-0.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"}`} />
                          <span className={`font-medium ${user.isOnline ? "text-green-700" : "text-muted-foreground"}`}>
                            {user.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                        {!user.isOnline && user.lastActivity && (
                          <span className="text-[9px] text-muted-foreground">
                            Last: {new Date(user.lastActivity).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{user.subscriptionPlan || "N/A"}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${user.subscriptionStatus === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}>
                        {user.subscriptionStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {user.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate).toLocaleDateString() : "N/A"}
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
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}>
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
                          <DropdownMenuItem onClick={() => setEditUser(user)}>
                            Edit Subscription
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewLicense(user.userId)}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Business License
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setTogglingUserId(user.userId)
                              toggleStatusMutation.mutate(user.userId)
                            }}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteUser(user)}
                          >
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
      )}

      {/* Edit Subscription Modal */}
      {editUser && (
        <EditSubscriptionModal
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => {
            if (!open) setEditUser(null)
          }}
        />
      )}

      {/* Delete User Confirmation Dialog */}
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

      {/* Create Test Account Modal */}
      <CreateTestAccountModal
        open={showCreateTest}
        onOpenChange={setShowCreateTest}
      />
    </div>
  )
}
