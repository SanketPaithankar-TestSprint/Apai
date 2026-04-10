# Simplified Backend Audit Log Plan

This plan details the database schema and public API endpoints required to track administrative activity in the **APAI-ADMIN** system.

## 1. Database Schema Design (SQL)

The audit log captures an immutable history of admin actions. We recommend the following table structure:

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_email VARCHAR(255) NOT NULL, -- Email of the admin performing the action
    action_type VARCHAR(50) NOT NULL,  -- e.g., 'CREATE', 'UPDATE', 'DELETE'
    resource_type VARCHAR(50) NOT NULL,-- e.g., 'BLOG', 'USER', 'SUBSCRIPTION'
    resource_id VARCHAR(100),          -- Specific ID of the affected resource
    payload JSONB,                      -- Full request body for historical reference
    status_code INTEGER,                -- HTTP status of the action (e.g., 200, 403, 500)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Event timestamp
);

-- Essential Performance Indexes
CREATE INDEX idx_audit_email ON audit_logs(admin_email);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
```

---

## 2. API Endpoints

Audit records follow a **Strict Append-Only** policy. No endpoints for editing or deleting records are permitted.

| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/admin/audit-logs` | **Create Log Entry**: Internal-use endpoint to record a new activity. |
| **GET** | `/admin/audit-logs` | **Retrieve Logs**: Paginated list of all logs for the Admin Panel. |
| **GET** | `/admin/audit-logs/{id}` | **Get Detail**: Access full metadata and JSON payload for a single log. |

### 2.1 Fetch Audit Logs
**Endpoint:** `GET /admin/audit-logs`

**Query Parameters:**
* `page`: Integer (default 0)
* `size`: Integer (default 20)
* `email`: Filter by admin email
* `action`: Filter by action type
* `resource`: Filter by entity type

**Example Response:**
```json
{
  "total": 1500,
  "data": [
    {
      "id": 501,
      "adminEmail": "arya@autopaneai.com",
      "actionType": "BLOG_PUBLISH",
      "resourceType": "BLOG",
      "resourceId": "1024",
      "createdAt": "2026-03-24T19:15:00Z"
    }
  ]
}
```

### 2.2 Get Detail
**Endpoint:** `GET /admin/audit-logs/{id}`

**Example Response:**
```json
{
  "id": 501,
  "adminEmail": "arya@autopaneai.com",
  "actionType": "BLOG_PUBLISH",
  "resourceType": "BLOG",
  "resourceId": "1024",
  "payload": {
    "title": "Welcome to AutoPane AI",
    "content": "...",
    "status": "PUBLISHED"
  },
  "statusCode": 200,
  "createdAt": "2026-03-24T19:15:00Z"
}
```
