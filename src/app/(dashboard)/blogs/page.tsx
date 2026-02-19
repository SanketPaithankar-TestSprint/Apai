export default function BlogsPage() {
  const blogs = [
    { id: 1, title: "Getting Started with Next.js", author: "John Doe", date: "2026-02-15", status: "Published" },
    { id: 2, title: "React Hooks Best Practices", author: "Jane Smith", date: "2026-02-10", status: "Published" },
    { id: 3, title: "TypeScript Tips and Tricks", author: "Bob Johnson", date: "2026-02-05", status: "Draft" },
  ]

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Blogs</h1>
      <p className="text-muted-foreground mb-8">Manage all blog posts in your system</p>

      <div className="border border-border rounded-none overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Author</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-6 py-3 text-sm font-medium">{blog.title}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{blog.author}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{blog.date}</td>
                <td className="px-6 py-3 text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-none ${
                    blog.status === "Published" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {blog.status}
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
