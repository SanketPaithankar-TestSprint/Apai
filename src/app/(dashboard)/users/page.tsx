"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  userId: number
  email: string
  ownerName: string
  phone: string
  alternatePhone: string
  businessName: string
  isActive: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  subscriptionExpiryDate: string
  createdAt: string
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null)

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
      // Handle different response formats
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
      // Invalidate the users query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTogglingUserId(null)
    },
    onError: (error) => {
      console.error("Error toggling status:", error)
      setTogglingUserId(null)
    },
  })

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
            subscriptionStatus: "INACTIVE",
            subscriptionPlan: "Standard",
            subscriptionExpiryDate: "2025-12-31T23:59:59.999Z",
            createdAt: "2024-12-01T10:00:00.000Z",
          },
        ]

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Users</h1>
      <p className="text-muted-foreground mb-8">Manage all users in your system</p>

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
        <div className="border border-border rounded-none overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-sm font-medium">Business Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Owner Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Subscription Plan</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Subscription Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr key={user.userId} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-3 text-sm font-medium">{user.businessName}</td>
                    <td className="px-6 py-3 text-sm">{user.ownerName}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{user.phone}</td>
                    <td className="px-6 py-3 text-sm">{user.subscriptionPlan}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-none whitespace-nowrap ${
                        user.subscriptionStatus === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {togglingUserId === user.userId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-muted-foreground">Updating...</span>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-none whitespace-nowrap ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {user.isActive ? "Active" : "Not Active"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-muted rounded transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled
                          >
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setTogglingUserId(user.userId)
                              toggleStatusMutation.mutate(user.userId)
                            }}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
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
    </div>
  )
}
