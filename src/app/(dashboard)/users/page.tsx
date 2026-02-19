export default function UsersPage() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "Active" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive" },
  ]

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Users</h1>
      <p className="text-muted-foreground mb-8">Manage all users in your system</p>

      <div className="border border-border rounded-none overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-6 py-3 text-sm">{user.name}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-3 text-sm">{user.role}</td>
                <td className="px-6 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-none ${
                    user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
