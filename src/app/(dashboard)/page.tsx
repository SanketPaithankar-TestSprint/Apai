export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Analytics</h1>
      <p className="text-muted-foreground mb-8">Welcome to your analytics dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border p-6 rounded-none">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Users</h3>
          <p className="text-3xl font-bold">1,234</p>
        </div>

        <div className="border border-border p-6 rounded-none">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Blogs</h3>
          <p className="text-3xl font-bold">56</p>
        </div>

        <div className="border border-border p-6 rounded-none">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Views</h3>
          <p className="text-3xl font-bold">12,456</p>
        </div>
      </div>
    </div>
  )
}
