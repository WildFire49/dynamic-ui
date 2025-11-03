# Workflow Configurator API Specification

## Overview

The UI Workflow Configurator allows users to visually create, configure, and manage form workflows by dragging and dropping components, connecting them, and configuring API integrations.

---

## 📦 Required Package Installation

```bash
npm install reactflow
# or
yarn add reactflow
```

---

## 🎯 JSON Schema Formats

### 1. **Component Library Response**

**Endpoint:** `GET /api/configurator/components`

**Response:**

```json
{
  "success": true,
  "data": {
    "library": {
      "version": "1.0.0",
      "last_updated": "2025-10-09T12:57:59+05:30",
      "components": [
        {
          "id": "l1_customer_info",
          "name": "L1 - Customer Information",
          "description": "Complete customer details for HDFC onboarding",
          "category": "onboarding",
          "icon": "person",
          "color": "#1976d2",
          "estimated_time": "5-7 mins",
          "fields_count": 45,
          "sections_count": 7,
          "is_entry_point": true,
          "is_exit_point": false,
          "default_next": "instant_kcc",
          "schema_preview": {
            "sections": [
              "Applicant Details",
              "KYC Address",
              "Current Address",
              "Bank Master",
              "Other Information",
              "PAN Card",
              "Other KYC"
            ]
          },
          "api_requirements": {
            "submit_endpoint": "/api/customer/l1/submit",
            "validation_endpoint": "/api/customer/l1/validate",
            "required_fields": ["full_name", "date_of_birth", "mobile_number"]
          }
        }
      ]
    },
    "categories": [
      "onboarding",
      "loan",
      "banking",
      "verification",
      "completion"
    ]
  }
}
```

---

### 2. **Get Full Component Schema**

**Endpoint:** `GET /api/configurator/components/{component_id}/schema`

**Example:** `GET /api/configurator/components/l1_customer_info/schema`

**Response:**

```json
{
  "success": true,
  "data": {
    "component_id": "l1_customer_info",
    "full_schema": {
      "id": "l1_customer_info",
      "title": "L1 - Customer Information",
      "description": "Complete customer details for HDFC onboarding",
      "nextFormId": "instant_kcc",
      "nextFormTitle": "Instant KCC - Land & Crop Details",
      "sections": [
        {
          "id": "applicant_details",
          "title": "Applicant Details",
          "subtitle": "Personal information of the applicant",
          "icon": "person",
          "fields": [
            {
              "id": "full_name",
              "type": "text",
              "label": "Full Name",
              "placeholder": "Enter your full name",
              "required": true,
              "icon": "person",
              "validation": {
                "pattern": "^[A-Za-z ]+$",
                "message": "Only alphabetic characters allowed"
              }
            }
          ]
        }
      ],
      "submitButton": {
        "label": "Submit",
        "action": "submit"
      }
    }
  }
}
```

---

### 3. **Workflow Configuration JSON** (Save Format)

**Endpoint:** `POST /api/configurator/workflows`
**Method:** `POST`

**Request Body:**

```json
{
  "workflow": {
    "name": "HDFC Agriculture KCC Onboarding",
    "description": "Complete customer onboarding flow for Kisan Credit Card",
    "version": "1.0.0",
    "metadata": {
      "total_steps": 5,
      "estimated_completion_time": "20-25 mins",
      "target_audience": "Agriculture customers",
      "language_support": ["en", "hi", "kn", "ta"]
    },
    "nodes": [
      {
        "node_id": "node_1",
        "component_id": "l1_customer_info",
        "position": { "x": 100, "y": 100 },
        "label": "Customer Information",
        "is_start_node": true,
        "config": {
          "skip_if_data_exists": false,
          "prefill_from_aadhaar": true,
          "required_score": 100,
          "timeout_seconds": 600,
          "api_config": {
            "submit_endpoint": "/api/v2/customer/l1/submit",
            "method": "POST",
            "headers": {
              "Authorization": "Bearer ${token}",
              "X-Workflow-Id": "${workflow_id}"
            },
            "on_success": {
              "action": "next",
              "save_to": "customer_data"
            },
            "on_error": {
              "action": "retry",
              "max_retries": 3,
              "fallback_node": null
            }
          }
        },
        "connections": [
          {
            "target_node_id": "node_2",
            "condition": {
              "type": "always",
              "rules": []
            },
            "label": "Submit Success"
          }
        ]
      },
      {
        "node_id": "node_2",
        "component_id": "instant_kcc",
        "position": { "x": 400, "y": 100 },
        "label": "Land & Loan Details",
        "is_start_node": false,
        "config": {
          "skip_if_data_exists": false,
          "validate_land_records": true,
          "api_config": {
            "submit_endpoint": "/api/v2/kcc/submit",
            "method": "POST"
          }
        },
        "connections": [
          {
            "target_node_id": "node_3",
            "condition": {
              "type": "conditional",
              "rules": [
                {
                  "field": "opted_loan_amount",
                  "operator": "greater_than",
                  "value": 0
                }
              ]
            },
            "label": "Loan Approved"
          }
        ]
      }
    ],
    "global_config": {
      "enable_save_draft": true,
      "enable_navigation_back": true,
      "enable_skip_optional": true,
      "session_timeout_minutes": 30,
      "auto_save_interval_seconds": 60,
      "data_encryption": true,
      "audit_logging": true
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "workflow_id": "workflow_12345",
    "name": "HDFC Agriculture KCC Onboarding",
    "status": "draft",
    "created_at": "2025-10-09T12:57:59+05:30",
    "version": "1.0.0"
  }
}
```

---

### 4. **List All Workflows**

**Endpoint:** `GET /api/configurator/workflows`

**Query Parameters:**

- `status` (optional): `draft`, `active`, `archived`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow_123",
        "name": "HDFC Agriculture KCC",
        "status": "active",
        "version": "2.0.0",
        "created_at": "2025-10-08T10:00:00+05:30",
        "updated_at": "2025-10-09T11:00:00+05:30",
        "created_by": "admin@HDFC.com",
        "node_count": 5,
        "execution_count": 1234
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

---

### 5. **Get Workflow by ID**

**Endpoint:** `GET /api/configurator/workflows/{workflow_id}`

**Response:**

```json
{
  "success": true,
  "data": {
    "workflow": {
      "id": "workflow_123",
      "name": "HDFC Agriculture KCC Onboarding",
      "description": "Complete customer onboarding flow for Kisan Credit Card",
      "version": "2.0.0",
      "status": "active",
      "created_at": "2025-10-08T10:00:00+05:30",
      "updated_at": "2025-10-09T11:00:00+05:30",
      "created_by": "admin@HDFC.com",
      "nodes": [...],
      "global_config": {...}
    }
  }
}
```

---

### 6. **Update Workflow**

**Endpoint:** `PUT /api/configurator/workflows/{workflow_id}`

**Request Body:**

```json
{
  "name": "Updated Workflow Name",
  "description": "Updated description",
  "nodes": [...],
  "global_config": {...}
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "workflow_id": "workflow_123",
    "version": "2.1.0",
    "updated_at": "2025-10-09T12:57:59+05:30"
  }
}
```

---

### 7. **Publish Workflow** (Draft → Active)

**Endpoint:** `POST /api/configurator/workflows/{workflow_id}/publish`

**Request Body:**

```json
{
  "version": "1.0.0",
  "publish_notes": "Initial release"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "workflow_id": "workflow_123",
    "status": "active",
    "version": "1.0.0",
    "published_at": "2025-10-09T12:57:59+05:30"
  }
}
```

---

### 8. **Validate Workflow**

**Endpoint:** `POST /api/configurator/workflows/{workflow_id}/validate`

**Response:**

```json
{
  "success": true,
  "data": {
    "is_valid": false,
    "errors": [
      {
        "node_id": "node_2",
        "field": "api_config.submit_endpoint",
        "message": "Submit endpoint is required",
        "severity": "error"
      }
    ],
    "warnings": [
      {
        "node_id": "node_3",
        "message": "No error handling configured",
        "severity": "warning"
      }
    ]
  }
}
```

---

### 9. **Test Workflow**

**Endpoint:** `POST /api/configurator/workflows/{workflow_id}/test`

**Request Body:**

```json
{
  "test_data": {
    "full_name": "Test User",
    "mobile_number": "9876543210"
  },
  "start_from_node": "node_1"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "test_session_id": "test_12345",
    "nodes_executed": ["node_1", "node_2", "node_3"],
    "execution_time_ms": 2345,
    "final_data": {...},
    "errors": []
  }
}
```

---

### 10. **Delete Workflow**

**Endpoint:** `DELETE /api/configurator/workflows/{workflow_id}`

**Response:**

```json
{
  "success": true,
  "data": {
    "workflow_id": "workflow_123",
    "deleted_at": "2025-10-09T12:57:59+05:30"
  }
}
```

---

## 🔄 Runtime Execution APIs

### 1. **Start Workflow Execution**

**Endpoint:** `POST /api/workflow/start`

**Request Body:**

```json
{
  "workflow_id": "workflow_123",
  "user_id": "user_456",
  "initial_data": {
    "prefilled_name": "John Doe",
    "prefilled_mobile": "9876543210"
  },
  "context": {
    "channel": "web",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "session_id": "session_789",
    "workflow_id": "workflow_123",
    "current_node_id": "node_1",
    "current_component": {
      "component_id": "l1_customer_info",
      "schema": {...},
      "prefilled_data": {...}
    },
    "started_at": "2025-10-09T12:57:59+05:30"
  }
}
```

---

### 2. **Get Current Node**

**Endpoint:** `GET /api/workflow/session/{session_id}/current`

**Response:**

```json
{
  "success": true,
  "data": {
    "session_id": "session_789",
    "current_node_id": "node_2",
    "component_schema": {...},
    "prefilled_data": {...},
    "progress": {
      "current_step": 2,
      "total_steps": 5,
      "percentage": 40
    }
  }
}
```

---

### 3. **Submit Node & Move to Next**

**Endpoint:** `POST /api/workflow/session/{session_id}/submit`

**Request Body:**

```json
{
  "node_id": "node_1",
  "form_data": {
    "full_name": "John Doe",
    "date_of_birth": "1990-01-15",
    "mobile_number": "9876543210"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "next_node_id": "node_2",
    "next_component": {
      "component_id": "instant_kcc",
      "schema": {...}
    },
    "saved_data": {...},
    "progress": {
      "current_step": 2,
      "total_steps": 5
    }
  }
}
```

---

### 4. **Save Draft & Exit**

**Endpoint:** `POST /api/workflow/session/{session_id}/draft`

**Request Body:**

```json
{
  "current_node_id": "node_2",
  "partial_data": {...}
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "draft_id": "draft_123",
    "session_id": "session_789",
    "saved_at": "2025-10-09T12:57:59+05:30",
    "resume_url": "/workflow/resume/draft_123"
  }
}
```

---

### 5. **Resume from Draft**

**Endpoint:** `POST /api/workflow/resume/{draft_id}`

**Response:**

```json
{
  "success": true,
  "data": {
    "session_id": "session_new_456",
    "current_node_id": "node_2",
    "component_schema": {...},
    "saved_data": {...}
  }
}
```

---

## 📊 Condition Types for Node Connections

### 1. **Always (Unconditional)**

```json
{
  "type": "always",
  "rules": []
}
```

### 2. **Conditional (Field-based)**

```json
{
  "type": "conditional",
  "rules": [
    {
      "field": "loan_amount",
      "operator": "greater_than",
      "value": 100000
    },
    {
      "field": "credit_score",
      "operator": "greater_than_or_equal",
      "value": 650
    }
  ],
  "logic": "AND" // or "OR"
}
```

**Supported Operators:**

- `equals`
- `not_equals`
- `greater_than`
- `greater_than_or_equal`
- `less_than`
- `less_than_or_equal`
- `contains`
- `not_contains`
- `in`
- `not_in`
- `is_empty`
- `is_not_empty`

### 3. **API Response Based**

```json
{
  "type": "api_response",
  "rules": [
    {
      "api_field": "response.approval_status",
      "operator": "equals",
      "value": "APPROVED"
    }
  ]
}
```

---

## 🔐 Security & Authentication

All API endpoints require authentication via:

**Header:**

```
Authorization: Bearer {jwt_token}
X-Workflow-Session: {session_id}  // For runtime APIs
```

**Error Responses:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  }
}
```

---

## 📈 Analytics APIs (Future Enhancement)

### Workflow Analytics

**Endpoint:** `GET /api/configurator/workflows/{workflow_id}/analytics`

**Response:**

```json
{
  "success": true,
  "data": {
    "total_executions": 1234,
    "completion_rate": 85.5,
    "average_completion_time_minutes": 18.5,
    "drop_off_points": [
      {
        "node_id": "node_3",
        "drop_off_rate": 12.3
      }
    ],
    "field_error_rates": {...}
  }
}
```

---

## 🛠️ Frontend Integration Example

```javascript
// Load component library
const loadComponents = async () => {
  const response = await fetch("/api/configurator/components");
  const data = await response.json();
  return data.data.library.components;
};

// Save workflow
const saveWorkflow = async (workflowConfig) => {
  const response = await fetch("/api/configurator/workflows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(workflowConfig),
  });
  return await response.json();
};

// Start workflow execution
const startWorkflow = async (workflowId, initialData) => {
  const response = await fetch("/api/workflow/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      workflow_id: workflowId,
      user_id: currentUserId,
      initial_data: initialData,
    }),
  });
  return await response.json();
};
```

---

---

## 🎨 Visual Component Rendering & API Configuration

### Component Visualization Response

**Endpoint:** `GET /api/configurator/components/{component_id}/preview`

**Response:**

```json
{
  "success": true,
  "data": {
    "component_id": "l1_customer_info",
    "preview": {
      "sections": [
        {
          "title": "Applicant Details",
          "field_count": 8,
          "preview_fields": [
            { "label": "Full Name", "type": "text", "required": true },
            { "label": "Date of Birth", "type": "date", "required": true },
            { "label": "Mobile Number", "type": "tel", "required": true }
          ]
        }
      ],
      "actions": [
        {
          "id": "submit_btn",
          "type": "button",
          "label": "Submit",
          "action_type": "submit",
          "has_api": false
        }
      ]
    }
  }
}
```

---

## 🔌 API Configuration for Components

### 1. **Add/Update Button API Configuration**

**Endpoint:** `POST /api/configurator/components/{component_id}/actions/{action_id}/api`

**Request Body:**

```json
{
  "api_config": {
    "method": "POST",
    "url": "https://api.openai.com/v1/chat/completions",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk-proj-xxx"
    },
    "params": {
      "timeout": "30"
    },
    "body": {
      "model": "gpt-4o",
      "messages": [{ "role": "user", "content": "Hello" }]
    },
    "response_mapping": {
      "success_field": "choices[0].message.content",
      "error_field": "error.message",
      "data_path": "data"
    },
    "on_success": {
      "action": "show_message",
      "message": "API call successful",
      "next_component": null
    },
    "on_error": {
      "action": "show_error",
      "retry_enabled": true,
      "max_retries": 3
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "component_id": "l1_customer_info",
    "action_id": "submit_btn",
    "api_configured": true,
    "updated_at": "2025-10-09T15:28:56+05:30"
  }
}
```

---

### 2. **Get Button API Configuration**

**Endpoint:** `GET /api/configurator/components/{component_id}/actions/{action_id}/api`

**Response:**

```json
{
  "success": true,
  "data": {
    "api_config": {
      "method": "POST",
      "url": "https://api.example.com/submit",
      "headers": {...},
      "body": {...},
      "configured_at": "2025-10-09T15:28:56+05:30",
      "last_tested": "2025-10-09T15:30:00+05:30",
      "test_status": "success"
    }
  }
}
```

---

### 3. **Test Button API Configuration**

**Endpoint:** `POST /api/configurator/components/{component_id}/actions/{action_id}/api/test`

**Request Body:**

```json
{
  "test_data": {
    "full_name": "Test User",
    "mobile": "9876543210"
  },
  "use_mock_data": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "test_id": "test_12345",
    "status": "success",
    "response_time_ms": 245,
    "response_data": {
      "message": "API call successful",
      "data": {...}
    },
    "headers_sent": {...},
    "headers_received": {...},
    "status_code": 200
  }
}
```

---

### 4. **Bulk API Configuration for Workflow**

**Endpoint:** `POST /api/configurator/workflows/{workflow_id}/api-configs/bulk`

**Request Body:**

```json
{
  "configurations": [
    {
      "node_id": "node_1",
      "action_id": "submit_btn",
      "api_config": {
        "method": "POST",
        "url": "https://api.example.com/l1/submit",
        "headers": {...},
        "body": {...}
      }
    },
    {
      "node_id": "node_2",
      "action_id": "verify_btn",
      "api_config": {
        "method": "GET",
        "url": "https://api.example.com/verify",
        "headers": {...}
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "configured_count": 2,
    "failed_count": 0,
    "results": [
      {
        "node_id": "node_1",
        "action_id": "submit_btn",
        "status": "success"
      }
    ]
  }
}
```

---

## 🎯 Component Field Configuration

### 1. **Update Field Properties**

**Endpoint:** `PUT /api/configurator/components/{component_id}/fields/{field_id}`

**Request Body:**

```json
{
  "field_updates": {
    "label": "Updated Label",
    "required": true,
    "placeholder": "Enter value here",
    "validation": {
      "pattern": "^[A-Z0-9]+$",
      "message": "Only uppercase alphanumeric allowed",
      "min_length": 5,
      "max_length": 20
    },
    "conditional_visibility": {
      "depends_on": "field_type",
      "show_when": {
        "operator": "equals",
        "value": "business"
      }
    },
    "api_mapping": {
      "request_field": "customer.full_name",
      "response_field": "data.name"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "field_id": "full_name",
    "updated": true,
    "component_version": "1.1.0"
  }
}
```

---

### 2. **Add New Field to Component**

**Endpoint:** `POST /api/configurator/components/{component_id}/fields`

**Request Body:**

```json
{
  "field": {
    "id": "pan_number",
    "type": "text",
    "label": "PAN Number",
    "placeholder": "ABCDE1234F",
    "required": true,
    "validation": {
      "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
      "message": "Invalid PAN format"
    },
    "section_id": "kyc_details",
    "position": 5
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "field_id": "pan_number",
    "component_id": "l1_customer_info",
    "added": true
  }
}
```

---

### 3. **Reorder Fields**

**Endpoint:** `PUT /api/configurator/components/{component_id}/fields/reorder`

**Request Body:**

```json
{
  "section_id": "applicant_details",
  "field_order": [
    "full_name",
    "date_of_birth",
    "mobile_number",
    "email",
    "gender"
  ]
}
```

---

## 🎨 Frontend Integration Guide

### 1. **Load Components with Visualization**

```javascript
// components/configurator/ComponentLibrary.jsx
import React, { useEffect, useState } from "react";
import { Box, Card, Typography, Chip } from "@mui/material";

const ComponentLibrary = ({ onAddComponent }) => {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    // Load component library
    fetch("/api/configurator/components")
      .then((res) => res.json())
      .then((data) => {
        setComponents(data.data.library.components);
      });
  }, []);

  const handleDragStart = (e, component) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  return (
    <Box sx={{ p: 2 }}>
      {components.map((component) => (
        <Card
          key={component.id}
          draggable
          onDragStart={(e) => handleDragStart(e, component)}
          sx={{ mb: 2, p: 2, cursor: "grab" }}
        >
          <Typography variant="h6">{component.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {component.description}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            <Chip label={`${component.fields_count} fields`} size="small" />
            <Chip
              label={component.estimated_time}
              size="small"
              color="primary"
            />
          </Box>
        </Card>
      ))}
    </Box>
  );
};
```

---

### 2. **Visual Component Preview**

```javascript
// components/configurator/ComponentPreview.jsx
import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, List, ListItem } from "@mui/material";

const ComponentPreview = ({ componentId }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (componentId) {
      fetch(`/api/configurator/components/${componentId}/preview`)
        .then((res) => res.json())
        .then((data) => setPreview(data.data.preview));
    }
  }, [componentId]);

  if (!preview) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Component Preview
      </Typography>
      {preview.sections.map((section, idx) => (
        <Box key={idx} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {section.title}
          </Typography>
          <List dense>
            {section.preview_fields.map((field, fIdx) => (
              <ListItem key={fIdx}>
                <Typography variant="body2">
                  {field.label}
                  {field.required && <span style={{ color: "red" }}>*</span>}
                  <span style={{ color: "#666", marginLeft: 8 }}>
                    ({field.type})
                  </span>
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Paper>
  );
};
```

---

### 3. **API Configuration Dialog Integration**

```javascript
// components/configurator/NodeSettings.jsx
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ApiConfigDialog from "./ApiConfigDialog";

const NodeSettings = ({ node, onUpdate }) => {
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleConfigureApi = (action) => {
    setSelectedAction(action);
    setApiDialogOpen(true);
  };

  const handleSaveApiConfig = async (apiConfig) => {
    // Save to backend
    const response = await fetch(
      `/api/configurator/components/${node.component_id}/actions/${selectedAction.id}/api`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_config: apiConfig }),
      }
    );

    if (response.ok) {
      // Update local state
      onUpdate({
        ...node,
        actions: node.actions.map((a) =>
          a.id === selectedAction.id ? { ...a, api: apiConfig } : a
        ),
      });
      setApiDialogOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Node Settings
      </Typography>

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Actions & API Configuration
      </Typography>

      {node.actions?.map((action) => (
        <Box
          key={action.id}
          sx={{ mb: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {action.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Type: {action.action_type}
          </Typography>
          <Button
            size="small"
            variant={action.api ? "contained" : "outlined"}
            onClick={() => handleConfigureApi(action)}
            sx={{ mt: 1 }}
          >
            {action.api ? "Edit API" : "Add API"}
          </Button>
        </Box>
      ))}

      <ApiConfigDialog
        open={apiDialogOpen}
        onClose={() => setApiDialogOpen(false)}
        onSave={handleSaveApiConfig}
        initialConfig={selectedAction?.api}
        buttonLabel={selectedAction?.label}
      />
    </Box>
  );
};
```

---

### 4. **Workflow Save with API Configs**

```javascript
// utils/workflowSerializer.js
export const serializeWorkflow = (nodes, edges) => {
  return {
    workflow: {
      name: "My Workflow",
      description: "Workflow description",
      version: "1.0.0",
      nodes: nodes.map((node) => ({
        node_id: node.id,
        component_id: node.data.component_id,
        position: node.position,
        label: node.data.label,
        is_start_node: node.data.isStartNode,
        config: {
          api_config: node.data.actions?.reduce((acc, action) => {
            if (action.api) {
              acc[action.id] = action.api;
            }
            return acc;
          }, {}),
          field_config: node.data.fields?.reduce((acc, field) => {
            acc[field.id] = {
              label: field.label,
              required: field.required,
              validation: field.validation,
            };
            return acc;
          }, {}),
        },
        connections: edges
          .filter((edge) => edge.source === node.id)
          .map((edge) => ({
            target_node_id: edge.target,
            condition: edge.data?.condition || { type: "always", rules: [] },
            label: edge.label,
          })),
      })),
      global_config: {
        enable_save_draft: true,
        enable_navigation_back: true,
        session_timeout_minutes: 30,
      },
    },
  };
};

// Save workflow
export const saveWorkflow = async (nodes, edges) => {
  const workflowData = serializeWorkflow(nodes, edges);

  const response = await fetch("/api/configurator/workflows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(workflowData),
  });

  return await response.json();
};
```

---

### 5. **Runtime Workflow Execution**

```javascript
// components/workflow/WorkflowRunner.jsx
import React, { useState, useEffect } from "react";
import DynamicUIRenderer from "../DynamicUIRenderer";

const WorkflowRunner = ({ workflowId }) => {
  const [session, setSession] = useState(null);
  const [currentSchema, setCurrentSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start workflow execution
    startWorkflow();
  }, [workflowId]);

  const startWorkflow = async () => {
    const response = await fetch("/api/workflow/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: workflowId,
        user_id: "user_123",
        initial_data: {},
      }),
    });

    const data = await response.json();
    if (data.success) {
      setSession(data.data);
      setCurrentSchema(data.data.current_component.schema);
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    const response = await fetch(
      `/api/workflow/session/${session.session_id}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: session.current_node_id,
          form_data: formData,
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      if (data.data.next_component) {
        setCurrentSchema(data.data.next_component.schema);
        setSession({
          ...session,
          current_node_id: data.data.next_node_id,
          progress: data.data.progress,
        });
      } else {
        // Workflow complete
        console.log("Workflow completed!");
      }
    }
  };

  if (loading) return <div>Loading workflow...</div>;

  return (
    <Box>
      {/* Progress Indicator */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2">
          Step {session.progress?.current_step} of{" "}
          {session.progress?.total_steps}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={session.progress?.percentage || 0}
        />
      </Box>

      {/* Dynamic Form Renderer */}
      <DynamicUIRenderer
        schema={currentSchema}
        onSubmit={handleSubmit}
        sessionData={session}
      />
    </Box>
  );
};
```

---

## 🔄 Complete Integration Flow

### Step 1: Configure Workflow

```
1. User drags components from library
2. Components are placed on canvas (ReactFlow)
3. User connects components with edges
4. User clicks "Settings" on a node
5. NodeSettings panel opens
6. User clicks "Add API" on a button
7. ApiConfigDialog opens (Postman-style)
8. User pastes cURL or manually configures
9. User tests API
10. User saves API config
11. Config is saved to backend
12. User saves entire workflow
```

### Step 2: Execute Workflow

```
1. User clicks "Run Workflow"
2. Frontend calls /api/workflow/start
3. Backend returns current_component schema
4. DynamicUIRenderer renders the form
5. User fills form and clicks button
6. If button has API config:
   - Frontend calls configured API
   - Processes response
   - Shows result to user
7. User clicks "Submit" or "Next"
8. Frontend calls /api/workflow/session/{id}/submit
9. Backend moves to next node
10. Repeat from step 4
```

---

## ✅ Summary

This API specification provides:

1. **Component Library Management** - Load available form components
2. **Workflow CRUD** - Create, read, update, delete workflows
3. **Visual Configuration** - Store node positions, connections, API configs
4. **Runtime Execution** - Execute workflows, handle submissions, manage sessions
5. **Validation & Testing** - Validate workflow structure, test with sample data
6. **Draft Management** - Save progress and resume later
7. **Conditional Routing** - Define rules for which node to go to next
8. **API Configuration** - Configure APIs for buttons/actions with Postman-like interface
9. **Component Visualization** - Preview components before adding to workflow
10. **Field Configuration** - Update field properties, validations, conditional logic
11. **Bulk Operations** - Configure multiple APIs at once
12. **Testing Infrastructure** - Test individual APIs and entire workflows

The system is fully compatible with your existing `DynamicUIRenderer` and form schemas from `sampleFormSchemas.js`.
