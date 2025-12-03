# Dashboard API Specification

## Overview
This document defines the API endpoints for persisting user dashboards and widgets to a database, replacing the current localStorage-based storage.

---

## Quick Start - Main Sync Endpoint

### Save/Sync Dashboard State (POST)
This is the primary endpoint to save the entire dashboard state for a user.

**Request:**
```http
POST /api/v1/dashboard/sync
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "us-sh-shc-09094",
  "dashboards": [
    {
      "id": "bm",
      "name": "Bank Manager",
      "icon": "SupervisorAccount",
      "color": "#7c3aed"
    },
    {
      "id": "rm",
      "name": "Regional Head",
      "icon": "Person",
      "color": "#059669"
    },
    {
      "id": "cxo-1764679897282",
      "name": "CXO",
      "icon": "Dashboard",
      "color": "#1976d2"
    }
  ],
  "activeDashboardId": "bm",
  "visualizationsByDashboard": {
    "bm": [
      {
        "id": "1764681516043",
        "title": "Please provide the total amount collected this month by Mangesh Murli Dipke from customers in the SMA0 bucket.",
        "originalPrompt": "Please provide the total amount collected this month by Mangesh Murli Dipke from customers in the SMA0 bucket.",
        "timestamp": "2025-12-02T13:18:37.248Z",
        "type": "pipeline",
        "question": "Please provide the total amount collected this month by Mangesh Murli Dipke from customers in the SMA0 bucket.",
        "supportingData": [
          { "sum(t.amount_paid)": 2694 }
        ],
        "pipelineData": [
          { "sum(t.amount_paid)": 2694 }
        ],
        "charts": {
          "pieChart": null,
          "barChart": null,
          "branchChart": null,
          "waterfallChart": null
        },
        "dataGrid": {
          "gridColumns": [
            {
              "field": "sum(t.amount_paid)",
              "headerName": "Sum(t.amount Paid)",
              "minWidth": 100,
              "flex": 1.1,
              "align": "right",
              "headerAlign": "right"
            }
          ],
          "gridRows": [
            { "id": 0, "sum(t.amount_paid)": 2694 }
          ]
        }
      }
    ],
    "rm": [],
    "cxo-1764679897282": []
  }
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Dashboard state synced successfully",
    "data": {
      "username": "us-sh-shc-09094",
      "dashboardCount": 3,
      "widgetCount": 5,
      "syncedAt": "2025-12-03T12:00:00Z"
    }
  }
}
```

### Get User Dashboard State (GET)
Retrieves the complete dashboard state for a user.

**Request:**
```http
GET /api/v1/dashboard/user/{username}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Dashboard state retrieved successfully",
    "data": {
      "dashboards": [
        {
          "id": "bm",
          "name": "Bank Manager",
          "icon": "SupervisorAccount",
          "color": "#7c3aed"
        },
        {
          "id": "rm",
          "name": "Regional Head",
          "icon": "Person",
          "color": "#059669"
        }
      ],
      "activeDashboardId": "bm",
      "visualizationsByDashboard": {
        "bm": [...],
        "rm": [...]
      }
    }
  }
}
```

---

## Data Models

### Dashboard
```json
{
  "id": "string",           // Unique dashboard ID (e.g., "bm", "rm", "dash-uuid")
  "name": "string",         // Display name (e.g., "BM Dashboard")
  "icon": "string",         // MUI icon name (e.g., "AccountBalance", "SupportAgent")
  "color": "string",        // Hex color (e.g., "#3B82F6")
  "order": "number",        // Display order (0, 1, 2...)
  "isDefault": "boolean",   // Whether this is the default dashboard
  "createdAt": "string",    // ISO timestamp
  "updatedAt": "string"     // ISO timestamp
}
```

### Widget (Visualization)
```json
{
  "id": "string",                    // Unique widget ID (e.g., "widget-uuid")
  "dashboardId": "string",           // Parent dashboard ID
  "type": "string",                  // Widget type: "analysis_widget" | "dynamic_data" | "chart" | "table"
  "title": "string",                 // Display title (editable by user)
  "prompt": "string",                // Original user question/prompt that generated this
  "order": "number",                 // Display order within dashboard
  
  // Widget dimensions
  "width": "number",                 // Grid width (1-12)
  "height": "number",                // Height in pixels (default: 400)
  
  // View preferences
  "viewMode": "string",              // "auto" | "area" | "bar" | "table"
  "chartType": "string",             // Detected/selected chart type
  
  // The actual data
  "data": "object",                  // The visualization data (see Data Structure below)
  
  // Metadata
  "source": "string",                // Data source (e.g., "buddi_agent", "sql_query")
  "conversationId": "string",        // Related conversation ID (if any)
  "createdAt": "string",             // ISO timestamp
  "updatedAt": "string",             // ISO timestamp
  "savedAt": "string"                // When user explicitly saved it
}
```

### Widget Data Structure
The `data` field can contain different structures based on widget type:

#### For `analysis_widget` type:
```json
{
  "analysis_result": {
    "summary": {
      "total_records": 100,
      "query": "Show me sales by region",
      "execution_time": 1.5
    },
    "supporting_data": [
      { "region": "North", "sales": 50000, "count": 120 },
      { "region": "South", "sales": 45000, "count": 98 }
    ],
    "insights": [
      "North region has highest sales",
      "South region growing 15% MoM"
    ]
  },
  "metadata": {
    "query_id": "q-uuid",
    "timestamp": "2025-12-03T10:00:00Z",
    "sql": "SELECT region, SUM(sales) FROM orders GROUP BY region"
  }
}
```

#### For `dynamic_data` type:
```json
{
  "data": [
    { "name": "Jan", "value": 4000 },
    { "name": "Feb", "value": 3000 }
  ],
  "question": "Show monthly trends",
  "title": "Monthly Analysis"
}
```

#### For `chart` / `table` type:
```json
{
  "data": [
    { "column1": "value1", "column2": 100 }
  ],
  "columns": ["column1", "column2"],
  "title": "Query Results"
}
```

---

## API Endpoints

### 1. Get User Dashboards
Retrieves all dashboards and their widgets for a user.

**Request:**
```http
GET /api/v1/dashboard/user/{username}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Dashboards retrieved successfully",
    "data": {
      "activeDashboardId": "bm",
      "dashboards": [
        {
          "id": "bm",
          "name": "BM Dashboard",
          "icon": "AccountBalance",
          "color": "#3B82F6",
          "order": 0,
          "isDefault": true,
          "createdAt": "2025-12-01T10:00:00Z",
          "updatedAt": "2025-12-03T10:00:00Z",
          "widgetCount": 5
        },
        {
          "id": "rm",
          "name": "RM Dashboard",
          "icon": "SupportAgent",
          "color": "#10B981",
          "order": 1,
          "isDefault": false,
          "createdAt": "2025-12-01T10:00:00Z",
          "updatedAt": "2025-12-02T15:30:00Z",
          "widgetCount": 3
        }
      ]
    }
  }
}
```

---

### 2. Get Dashboard Widgets
Retrieves all widgets for a specific dashboard.

**Request:**
```http
GET /api/v1/dashboard/{dashboardId}/widgets?username={username}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Widgets retrieved successfully",
    "data": {
      "dashboardId": "bm",
      "widgets": [
        {
          "id": "widget-abc123",
          "dashboardId": "bm",
          "type": "analysis_widget",
          "title": "Monthly Sales Analysis",
          "prompt": "Show me the total sales for this month by region",
          "order": 0,
          "width": 12,
          "height": 400,
          "viewMode": "auto",
          "chartType": "bar",
          "data": {
            "analysis_result": {
              "summary": { "total_records": 50 },
              "supporting_data": [
                { "region": "North", "sales": 125000 },
                { "region": "South", "sales": 98000 }
              ]
            }
          },
          "source": "buddi_agent",
          "conversationId": "conv-xyz789",
          "createdAt": "2025-12-03T09:00:00Z",
          "updatedAt": "2025-12-03T09:00:00Z"
        },
        {
          "id": "widget-def456",
          "dashboardId": "bm",
          "type": "dynamic_data",
          "title": "Customer Distribution",
          "prompt": "How many customers are in each state?",
          "order": 1,
          "width": 6,
          "height": 350,
          "viewMode": "bar",
          "chartType": "bar",
          "data": {
            "data": [
              { "state": "Maharashtra", "count": 15000 },
              { "state": "Karnataka", "count": 12000 }
            ],
            "question": "How many customers are in each state?"
          },
          "source": "sql_query",
          "createdAt": "2025-12-02T14:30:00Z",
          "updatedAt": "2025-12-02T14:30:00Z"
        }
      ]
    }
  }
}
```

---

### 3. Create Dashboard
Creates a new dashboard for a user.

**Request:**
```http
POST /api/v1/dashboard
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "name": "Custom Dashboard",
  "icon": "Dashboard",
  "color": "#8B5CF6"
}
```

**Response (201 Created):**
```json
{
  "status": 201,
  "data": {
    "message": "Dashboard created successfully",
    "data": {
      "id": "dash-new123",
      "name": "Custom Dashboard",
      "icon": "Dashboard",
      "color": "#8B5CF6",
      "order": 2,
      "isDefault": false,
      "createdAt": "2025-12-03T11:00:00Z",
      "updatedAt": "2025-12-03T11:00:00Z"
    }
  }
}
```

---

### 4. Update Dashboard
Updates dashboard properties (name, icon, color).

**Request:**
```http
PUT /api/v1/dashboard/{dashboardId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "name": "Updated Dashboard Name",
  "icon": "Analytics",
  "color": "#EC4899"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Dashboard updated successfully",
    "data": {
      "id": "dash-new123",
      "name": "Updated Dashboard Name",
      "icon": "Analytics",
      "color": "#EC4899",
      "updatedAt": "2025-12-03T11:30:00Z"
    }
  }
}
```

---

### 5. Delete Dashboard
Deletes a dashboard and all its widgets.

**Request:**
```http
DELETE /api/v1/dashboard/{dashboardId}?username={username}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Dashboard deleted successfully",
    "data": {
      "deletedDashboardId": "dash-new123",
      "deletedWidgetCount": 5
    }
  }
}
```

---

### 6. Save Widget
Saves a new widget to a dashboard.

**Request:**
```http
POST /api/v1/dashboard/{dashboardId}/widget
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "type": "analysis_widget",
  "title": "Monthly Collection Report",
  "prompt": "Show me total collection this month by Mangesh from OTR bucket",
  "width": 12,
  "height": 400,
  "viewMode": "auto",
  "data": {
    "analysis_result": {
      "summary": {
        "total_records": 25,
        "query": "Show me total collection this month by Mangesh from OTR bucket",
        "execution_time": 2.3
      },
      "supporting_data": [
        {
          "collector_name": "Mangesh Murli Dipke",
          "bucket": "OTR",
          "total_collected": 1250000,
          "customer_count": 25,
          "avg_collection": 50000
        }
      ],
      "insights": [
        "Total collection: ₹12.5L from 25 customers",
        "Average collection per customer: ₹50,000"
      ]
    },
    "metadata": {
      "query_id": "q-abc123",
      "timestamp": "2025-12-03T10:30:00Z",
      "sql": "SELECT collector_name, bucket, SUM(amount) as total_collected..."
    }
  },
  "source": "buddi_agent",
  "conversationId": "conv-xyz789"
}
```

**Response (201 Created):**
```json
{
  "status": 201,
  "data": {
    "message": "Widget saved successfully",
    "data": {
      "id": "widget-new789",
      "dashboardId": "bm",
      "type": "analysis_widget",
      "title": "Monthly Collection Report",
      "prompt": "Show me total collection this month by Mangesh from OTR bucket",
      "order": 0,
      "width": 12,
      "height": 400,
      "viewMode": "auto",
      "createdAt": "2025-12-03T10:30:00Z",
      "updatedAt": "2025-12-03T10:30:00Z"
    }
  }
}
```

---

### 7. Update Widget
Updates widget properties (title, dimensions, view mode, order).

**Request:**
```http
PUT /api/v1/dashboard/{dashboardId}/widget/{widgetId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "title": "Updated Widget Title",
  "width": 6,
  "height": 350,
  "viewMode": "bar",
  "order": 2
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Widget updated successfully",
    "data": {
      "id": "widget-new789",
      "title": "Updated Widget Title",
      "width": 6,
      "height": 350,
      "viewMode": "bar",
      "order": 2,
      "updatedAt": "2025-12-03T11:00:00Z"
    }
  }
}
```

---

### 8. Delete Widget
Deletes a widget from a dashboard.

**Request:**
```http
DELETE /api/v1/dashboard/{dashboardId}/widget/{widgetId}?username={username}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Widget deleted successfully",
    "data": {
      "deletedWidgetId": "widget-new789"
    }
  }
}
```

---

### 9. Move Widget Between Dashboards
Moves a widget from one dashboard to another.

**Request:**
```http
POST /api/v1/dashboard/widget/move
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "widgetId": "widget-abc123",
  "fromDashboardId": "bm",
  "toDashboardId": "rm"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Widget moved successfully",
    "data": {
      "widgetId": "widget-abc123",
      "fromDashboardId": "bm",
      "toDashboardId": "rm",
      "newOrder": 0
    }
  }
}
```

---

### 10. Reorder Widgets
Updates the order of widgets within a dashboard.

**Request:**
```http
PUT /api/v1/dashboard/{dashboardId}/widgets/reorder
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "widgetOrder": [
    { "widgetId": "widget-def456", "order": 0 },
    { "widgetId": "widget-abc123", "order": 1 },
    { "widgetId": "widget-ghi789", "order": 2 }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Widget order updated successfully",
    "data": {
      "dashboardId": "bm",
      "updatedCount": 3
    }
  }
}
```

---

### 11. Set Active Dashboard
Sets the user's active/default dashboard.

**Request:**
```http
PUT /api/v1/dashboard/active
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "dashboardId": "rm"
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Active dashboard updated",
    "data": {
      "activeDashboardId": "rm"
    }
  }
}
```

---

### 12. Bulk Sync (Full State)
Syncs the entire dashboard state (for initial migration or recovery).

**Request:**
```http
POST /api/v1/dashboard/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "us-sh-shc-09094",
  "activeDashboardId": "bm",
  "dashboards": [
    {
      "id": "bm",
      "name": "BM Dashboard",
      "icon": "AccountBalance",
      "color": "#3B82F6",
      "order": 0
    },
    {
      "id": "rm",
      "name": "RM Dashboard",
      "icon": "SupportAgent",
      "color": "#10B981",
      "order": 1
    }
  ],
  "widgets": [
    {
      "id": "widget-abc123",
      "dashboardId": "bm",
      "type": "analysis_widget",
      "title": "Sales Report",
      "prompt": "Show sales by region",
      "order": 0,
      "data": { ... }
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": 200,
  "data": {
    "message": "Dashboard state synced successfully",
    "data": {
      "dashboardCount": 2,
      "widgetCount": 5,
      "syncedAt": "2025-12-03T12:00:00Z"
    }
  }
}
```

---

## Database Schema Suggestion

### Tables

#### `user_dashboards`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) | Primary key |
| username | VARCHAR(100) | User identifier |
| name | VARCHAR(255) | Dashboard name |
| icon | VARCHAR(50) | MUI icon name |
| color | VARCHAR(10) | Hex color |
| order | INT | Display order |
| is_default | BOOLEAN | Default dashboard flag |
| is_active | BOOLEAN | Currently active |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

#### `dashboard_widgets`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) | Primary key |
| dashboard_id | VARCHAR(50) | Foreign key to dashboards |
| username | VARCHAR(100) | User identifier |
| type | VARCHAR(50) | Widget type |
| title | VARCHAR(255) | Display title |
| prompt | TEXT | Original prompt |
| order | INT | Display order |
| width | INT | Grid width |
| height | INT | Height in pixels |
| view_mode | VARCHAR(20) | View mode preference |
| chart_type | VARCHAR(20) | Chart type |
| data | JSONB | Widget data (JSON) |
| source | VARCHAR(50) | Data source |
| conversation_id | VARCHAR(50) | Related conversation |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

---

## Error Responses

### 400 Bad Request
```json
{
  "status": 400,
  "data": {
    "message": "Invalid request",
    "error": "Dashboard name is required"
  }
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "data": {
    "message": "Unauthorized",
    "error": "Invalid or expired token"
  }
}
```

### 404 Not Found
```json
{
  "status": 404,
  "data": {
    "message": "Not found",
    "error": "Dashboard not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "status": 500,
  "data": {
    "message": "Internal server error",
    "error": "Database connection failed"
  }
}
```

---

## Notes

1. **Username**: Use the `username` field (e.g., `us-sh-shc-09094`) not the UUID for user identification
2. **Widget Data**: The `data` field is stored as JSON/JSONB to support flexible data structures
3. **Ordering**: Widgets and dashboards maintain order for consistent display
4. **Soft Delete**: Consider implementing soft delete for recovery purposes
5. **Caching**: Consider caching frequently accessed dashboards for performance
6. **Pagination**: For users with many widgets, consider paginating the widget list
