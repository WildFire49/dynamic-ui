# Customer Verification Panel - JSON Configuration Guide

## Overview

The `CustomerVerificationPanel` component is now fully JSON-driven. All customer data, images, sections, comments, and actions are configured through the `customerVerificationPanelConfig.js` file.

## JSON Structure

### Top-Level Structure

```javascript
{
  "CUSTOMER_ID": {
    customer: { ... },
    documentImages: [ ... ],
    sections: [ ... ],
    stats: { ... },
    internalComments: [ ... ],
    actions: { ... }
  }
}
```

## Configuration Fields

### 1. Customer Information

```javascript
customer: {
  id: "IL_HD_AH_305",           // Customer ID
  name: "Arjun Patel",          // Customer name
  overallStatus: "PENDING"      // Overall verification status
}
```

### 2. Document Images

Array of images to display in the photo preview section:

```javascript
documentImages: [
  {
    id: "doc_1",                                      // Unique image ID
    url: "https://example.com/image.jpg",            // Image URL
    label: "Profile Photo",                          // Image label (shown in tooltip)
    type: "profile"                                  // Image type/category
  },
  // ... more images
]
```

**Image Types:**
- `profile` - Customer profile photo
- `aadhaar_front` - Aadhaar card front
- `aadhaar_back` - Aadhaar card back
- `pan` - PAN card
- `bank_statement` - Bank statement
- `land_docs` - Land documents
- Custom types as needed

### 3. Sections

Array of sections with comment capability:

```javascript
sections: [
  {
    id: "applicant_details",        // Unique section ID
    title: "Applicant Details",     // Section title
    type: "data",                   // Section type (always "data")
    allowComments: true,            // Enable/disable comments for this section
    fields: [
      {
        id: "full_name",            // Field ID
        label: "Full Name",         // Field label
        value: "Arjun Patel",       // Field value
        status: "verified"          // Field status: "verified" | "pending" | "rejected"
      },
      // ... more fields
    ]
  },
  // ... more sections
]
```

### 4. Statistics

Verification statistics displayed in header:

```javascript
stats: {
  totalFields: 9,           // Total number of fields across all sections
  verifiedFields: 9,        // Number of verified fields
  pendingFields: 0          // Number of pending fields
}
```

### 5. Internal Comments

Array of internal review comments:

```javascript
internalComments: [
  {
    id: "comment_1",                      // Unique comment ID
    category: "Customer Image",           // Comment category
    status: "approved",                   // Status: "approved" | "rejected"
    text: "Clear image uploaded.",        // Comment text
    icon: "CheckCircle"                   // Icon name (MUI icon)
  },
  // ... more comments
]
```

**Comment Status:**
- `approved` - Green background, success color
- `rejected` - Red background, error color

### 6. Actions

Action buttons configuration:

```javascript
actions: {
  approve: {
    label: "Approve",                 // Button label
    icon: "ThumbUp",                  // Icon name
    color: "success",                 // Button color: "success" | "error" | "primary"
    enabled: true                     // Enable/disable button
  },
  reject: {
    label: "Reject",
    icon: "ThumbDown",
    color: "error",
    enabled: true
  },
  sendBack: {
    label: "Send Back for Correction",
    icon: "Send",
    color: "primary",
    enabled: true
  }
}
```

## Usage

### Adding a New Customer

1. Open `customerVerificationPanelConfig.js`
2. Add a new entry with the customer's ID as the key:

```javascript
export const customerVerificationPanelConfig = {
  // ... existing customers
  
  "NEW_CUSTOMER_ID": {
    customer: {
      id: "NEW_CUSTOMER_ID",
      name: "New Customer Name",
      overallStatus: "PENDING"
    },
    documentImages: [
      // Add customer's document images
    ],
    sections: [
      // Add customer's verification sections
    ],
    stats: {
      totalFields: 0,
      verifiedFields: 0,
      pendingFields: 0
    },
    internalComments: [],
    actions: {
      approve: { label: "Approve", icon: "ThumbUp", color: "success", enabled: true },
      reject: { label: "Reject", icon: "ThumbDown", color: "error", enabled: true },
      sendBack: { label: "Send Back for Correction", icon: "Send", color: "primary", enabled: true }
    }
  }
};
```

### Using the Component

The component automatically loads the correct configuration based on the customer ID:

```javascript
<CustomerVerificationPanel 
  verificationData={{
    customer: {
      mifixId: "IL_HD_AH_305"  // Customer ID to load config for
    }
  }}
  onAction={(action, data) => {
    // Handle action
  }}
/>
```

## Features

### 1. Photo Preview
- Displays up to 6 images in a 2x3 grid
- Tooltip shows full image name on hover
- Click to select images (max 2)
- Auto-opens comparison dialog when 2 images selected

### 2. Section Comments
- Dynamic based on `allowComments: true`
- One comment field per section
- Section title and icon shown

### 3. Internal Review Comments
- Renders from `internalComments` array
- Color-coded based on status
- Multiple comments supported

### 4. Action Buttons
- Dynamically rendered from config
- Can be enabled/disabled per customer
- Custom labels and colors

### 5. Statistics
- Shows verified/total fields ratio
- Overall status chip

## Default Fallback

If a customer ID is not found, the component uses the `default` configuration:

```javascript
const customerId = customer?.mifixId || customer?.id || "default";
const panelConfig = getCustomerPanelConfig(customerId);
```

## Helper Function

```javascript
import { getCustomerPanelConfig } from "./customerVerificationPanelConfig";

const config = getCustomerPanelConfig("IL_HD_AH_305");
// Returns configuration for Arjun Patel
```

## Example: Complete Customer Configuration

```javascript
"IL_HD_AH_305": {
  customer: {
    id: "IL_HD_AH_305",
    name: "Arjun Patel",
    overallStatus: "PENDING"
  },
  documentImages: [
    { id: "doc_1", url: "https://...", label: "Profile Photo", type: "profile" },
    { id: "doc_2", url: "https://...", label: "Aadhaar Front", type: "aadhaar_front" },
    { id: "doc_3", url: "https://...", label: "Aadhaar Back", type: "aadhaar_back" },
    { id: "doc_4", url: "https://...", label: "PAN Card", type: "pan" },
    { id: "doc_5", url: "https://...", label: "Bank Statement", type: "bank_statement" },
    { id: "doc_6", url: "https://...", label: "Land Documents", type: "land_docs" }
  ],
  sections: [
    {
      id: "applicant_details",
      title: "Applicant Details",
      type: "data",
      allowComments: true,
      fields: [
        { id: "full_name", label: "Full Name", value: "Arjun Patel", status: "verified" },
        { id: "dob", label: "Date of Birth", value: "15/06/1985", status: "verified" },
        { id: "age", label: "Age", value: "38", status: "verified" }
      ]
    }
  ],
  stats: {
    totalFields: 3,
    verifiedFields: 3,
    pendingFields: 0
  },
  internalComments: [
    {
      id: "comment_1",
      category: "Customer Image",
      status: "approved",
      text: "Clear image of customer uploaded.",
      icon: "CheckCircle"
    }
  ],
  actions: {
    approve: { label: "Approve", icon: "ThumbUp", color: "success", enabled: true },
    reject: { label: "Reject", icon: "ThumbDown", color: "error", enabled: true },
    sendBack: { label: "Send Back for Correction", icon: "Send", color: "primary", enabled: true }
  }
}
```

## Benefits

✅ **Centralized Configuration** - All customer data in one place
✅ **Easy Updates** - Change JSON, not component code
✅ **Scalable** - Add unlimited customers
✅ **Flexible** - Different data for each customer
✅ **Type-Safe** - Clear structure and validation
✅ **Maintainable** - Separate data from UI logic
