# API Configuration Chat Integration

## ✅ Feature Complete!

You can now configure component APIs using natural language chat directly from the workflow builder canvas!

---

## 🎯 What Was Built

### 1. **API Configuration Chat Dialog** (`ApiConfigChatDialog.jsx`)
A full-featured chat interface for configuring component APIs using natural language.

**Features:**
- 💬 Natural language API configuration
- 📋 Automatic form schema loading
- 🔧 Real-time configuration generation
- ✅ Visual feedback with success/error messages
- 📝 JSON configuration preview
- 🎨 Modern, intuitive UI

---

## 🔄 User Workflow

### Step 1: Add Component to Canvas
1. Go to **Component Library** tab
2. Drag a form component to the canvas
3. Component appears as a node

### Step 2: Click Configure Button
1. Click the **⚙️ Configure** button on any canvas node
2. API Configuration Chat Dialog opens

### Step 3: Describe API Integration
Use natural language to configure APIs:

**Examples:**
```
"Add Verify KYC button that calls /api/kyc/verify with aadhaar field"

"Load districts from /api/locations/districts when state changes"

"Submit form to /api/customer/create on button click"

"Update name and dob fields from API response"
```

### Step 4: Review & Apply
1. LLM generates the API configuration
2. Configuration is displayed in JSON format
3. Configuration is automatically applied to the component
4. Success message confirms the update

---

## 🏗️ Architecture

### Component Structure

```
Workflow Builder (page.js)
├── Component Library Tab
│   └── Draggable form components
├── UI Builder Tab
│   └── AI form generation chat
└── Canvas Area
    ├── Form Nodes (FormPreviewNode)
    │   ├── Preview Button
    │   ├── Configure Button ← Opens API Config Chat
    │   └── Delete Button
    └── API Config Chat Dialog (ApiConfigChatDialog)
        ├── Chat Interface
        ├── Message History
        ├── Configuration Preview
        └── Input Field
```

---

## 📡 API Integration

### Backend Endpoints Used

#### 1. **Get Form Schema**
```bash
GET /api/v1/configurator/ui-configurator/schemas/{form_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "form_id": "customer_information_form",
    "parsed_schema": {
      "sections": [
        {
          "fields": [
            { "id": "full_name", "type": "text", "label": "Full Name" },
            { "id": "aadhaar", "type": "text", "label": "Aadhaar Number" }
          ]
        }
      ]
    },
    "usage_instructions": "..."
  }
}
```

#### 2. **Generate API Configuration**
```bash
POST /api/v1/configurator/ui-configurator/generate
```

**Request:**
```json
{
  "prompt": "Add Verify KYC button that calls /api/kyc/verify with aadhaar field",
  "form_id": "customer_information_form",
  "user_id": "vaishakhsk",
  "component_id": "kyc_form"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "API configuration generated successfully!",
    "config": {
      "id": "verify_kyc",
      "type": "button",
      "buttonLabel": "Verify KYC",
      "api": {
        "endpoint": "/api/kyc/verify",
        "method": "POST",
        "body": {
          "aadhaar": "${aadhaar}"
        },
        "onSuccess": {
          "action": "updateFields",
          "fields": {
            "customer_name": "response.data.name",
            "dob": "response.data.dob"
          }
        }
      }
    }
  }
}
```

---

## 📝 Files Created/Modified

### New Files:

#### `/src/components/configurator/ApiConfigChatDialog.jsx`
**Purpose:** Chat interface for API configuration

**Key Features:**
- Chat message rendering (user, assistant, system, error)
- Schema fetching on dialog open
- Natural language API configuration
- JSON configuration preview
- Real-time updates

**Props:**
- `open` - Dialog open state
- `onClose` - Close handler
- `component` - Selected component
- `formId` - Form ID for schema fetching
- `onConfigUpdate` - Callback when config is updated

---

### Modified Files:

#### `/src/app/configurator/ui/page.js`

**Changes:**
1. **Import Added:**
   ```javascript
   import ApiConfigChatDialog from "@/components/configurator/ApiConfigChatDialog";
   ```

2. **State Variables Added:**
   ```javascript
   const [apiConfigChatOpen, setApiConfigChatOpen] = useState(false);
   const [selectedNodeForConfig, setSelectedNodeForConfig] = useState(null);
   ```

3. **Handler Updated:**
   ```javascript
   const handleConfigureNode = useCallback((component) => {
     const node = nodes.find(n => n.data.component?.id === component.id);
     setSelectedComponent(component);
     setSelectedNodeForConfig(node);
     setApiConfigChatOpen(true);
   }, [nodes]);
   ```

4. **New Handler Added:**
   ```javascript
   const handleApiConfigUpdate = useCallback((config) => {
     // Updates node schema with API configuration
     setNodes((nds) =>
       nds.map((node) => {
         if (node.id === selectedNodeForConfig.id) {
           return {
             ...node,
             data: {
               ...node.data,
               schema: {
                 ...node.data.schema,
                 api_config: config,
               },
             },
           };
         }
         return node;
       })
     );
   }, [selectedNodeForConfig, setNodes]);
   ```

5. **Dialog Component Added:**
   ```javascript
   <ApiConfigChatDialog
     open={apiConfigChatOpen}
     onClose={() => {
       setApiConfigChatOpen(false);
       setSelectedComponent(null);
       setSelectedNodeForConfig(null);
     }}
     component={selectedComponent}
     formId={selectedComponent?.id}
     onConfigUpdate={handleApiConfigUpdate}
   />
   ```

---

## 🎨 UI/UX Features

### Chat Interface

**Welcome Message:**
```
🔧 API Configuration Assistant

I'll help you configure APIs for your component.

Examples:
- "Add Verify KYC button that calls /api/kyc/verify"
- "Load districts from /api/locations/districts when state changes"
- "Submit form to /api/customer/create on button click"
- "Update name field from API response"
```

**Message Types:**
1. **System Messages** - Purple background, info/instructions
2. **User Messages** - Blue background, right-aligned
3. **Assistant Messages** - White background, left-aligned
4. **Error Messages** - Red tinted background

**Configuration Preview:**
- JSON syntax highlighting
- Scrollable code block
- Copy-friendly format

---

## 💡 Example Use Cases

### 1. **KYC Verification Button**

**User Input:**
```
Add Verify KYC button that calls /api/kyc/verify with aadhaar field 
and updates name, dob from response
```

**Generated Config:**
```json
{
  "id": "verify_kyc",
  "type": "button",
  "buttonLabel": "Verify KYC",
  "api": {
    "endpoint": "/api/kyc/verify",
    "method": "POST",
    "body": {
      "aadhaar": "${aadhaar}"
    },
    "onSuccess": {
      "action": "updateFields",
      "fields": {
        "customer_name": "response.data.name",
        "dob": "response.data.dob"
      }
    }
  }
}
```

### 2. **Dynamic Dropdown**

**User Input:**
```
Load districts from /api/locations/districts when state field changes
```

**Generated Config:**
```json
{
  "id": "district",
  "type": "dropdown",
  "api": {
    "endpoint": "/api/locations/districts",
    "method": "GET",
    "params": {
      "state": "${state}"
    },
    "trigger": "onChange",
    "watchField": "state",
    "dataPath": "response.data.districts"
  }
}
```

### 3. **Form Submission**

**User Input:**
```
Submit form to /api/customer/create on button click
```

**Generated Config:**
```json
{
  "id": "submit_form",
  "type": "button",
  "buttonLabel": "Submit",
  "api": {
    "endpoint": "/api/customer/create",
    "method": "POST",
    "body": "${formData}",
    "onSuccess": {
      "action": "navigate",
      "route": "/success"
    }
  }
}
```

### 4. **Field Validation**

**User Input:**
```
Validate PAN number using /api/validate/pan when user enters it
```

**Generated Config:**
```json
{
  "id": "pan_number",
  "type": "text",
  "validation": {
    "api": {
      "endpoint": "/api/validate/pan",
      "method": "POST",
      "body": {
        "pan": "${pan_number}"
      },
      "trigger": "onBlur"
    }
  }
}
```

---

## 🔧 Technical Details

### State Management

**Component-Level State:**
```javascript
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [componentSchema, setComponentSchema] = useState(null);
```

**Page-Level State:**
```javascript
const [apiConfigChatOpen, setApiConfigChatOpen] = useState(false);
const [selectedNodeForConfig, setSelectedNodeForConfig] = useState(null);
```

### Data Flow

```
1. User clicks Configure button on canvas node
   ↓
2. handleConfigureNode() called
   ↓
3. Find node, set selected component
   ↓
4. Open ApiConfigChatDialog
   ↓
5. Dialog fetches form schema from API
   ↓
6. User types natural language prompt
   ↓
7. Send to backend API for configuration generation
   ↓
8. LLM generates API configuration JSON
   ↓
9. Display configuration in chat
   ↓
10. Call onConfigUpdate() with config
   ↓
11. Update node schema in canvas
   ↓
12. Show success message
```

---

## 🎯 Key Features

### ✅ Natural Language Processing
- Describe APIs in plain English
- No need to write JSON manually
- LLM understands context and intent

### ✅ Schema-Aware
- Automatically loads form schema
- Knows all available fields
- Validates field references

### ✅ Real-Time Updates
- Configuration applied immediately
- Visual feedback on success/error
- No page refresh needed

### ✅ Flexible Configuration
- Button APIs (onClick)
- Dropdown APIs (dynamic options)
- Field validation APIs (onBlur)
- Form submission APIs
- Field auto-population

### ✅ Developer-Friendly
- JSON preview for debugging
- Clear error messages
- Conversation history
- Easy to extend

---

## 🧪 Testing

### Manual Testing Steps:

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to Workflow Builder:**
   ```
   http://localhost:3000/configurator/ui
   ```

3. **Add a component to canvas:**
   - Go to Component Library tab
   - Drag "L1 - Customer Information" to canvas

4. **Open API Configuration:**
   - Click ⚙️ Configure button on the node
   - API Config Chat Dialog opens

5. **Test API Configuration:**
   ```
   Add Verify KYC button that calls /api/kyc/verify
   ```

6. **Verify:**
   - Check console for API calls
   - Check configuration preview
   - Check success message

---

## 🚀 Future Enhancements

### Possible Improvements:

1. **Configuration Templates**
   ```javascript
   - Pre-built templates for common APIs
   - Quick select from dropdown
   - One-click apply
   ```

2. **API Testing**
   ```javascript
   - Test API calls directly from dialog
   - Mock data for testing
   - Response preview
   ```

3. **Configuration History**
   ```javascript
   - Save previous configurations
   - Reuse configurations
   - Version control
   ```

4. **Multi-Field Configuration**
   ```javascript
   - Configure multiple fields at once
   - Batch operations
   - Dependency management
   ```

5. **Visual API Builder**
   ```javascript
   - Drag-and-drop API builder
   - Visual field mapping
   - Response path selector
   ```

---

## 📊 Benefits

### For Users:
- ✅ **Easy API Integration** - No coding required
- ✅ **Fast Configuration** - Describe in natural language
- ✅ **Visual Feedback** - See configuration immediately
- ✅ **Error Prevention** - Schema-aware validation

### For Developers:
- ✅ **Clean Architecture** - Modular components
- ✅ **Easy to Extend** - Add new API types easily
- ✅ **Well Documented** - Clear code and comments
- ✅ **Type Safe** - Proper prop types

### For Business:
- ✅ **Faster Development** - Reduce configuration time
- ✅ **Less Errors** - AI-generated configs
- ✅ **Better UX** - Intuitive interface
- ✅ **Scalable** - Works with any number of forms

---

## 🎓 How It Works

### Backend LLM Processing:

1. **Receives prompt:** "Add Verify KYC button..."
2. **Loads form schema:** Gets all field IDs
3. **Analyzes intent:** Understands user wants a button with API call
4. **Generates config:** Creates proper JSON structure
5. **Returns response:** Sends config back to frontend

### Frontend Processing:

1. **Displays message:** Shows user's prompt
2. **Shows loading:** Indicates processing
3. **Receives config:** Gets JSON from backend
4. **Displays config:** Shows in chat with preview
5. **Updates schema:** Applies to component
6. **Shows success:** Confirms update

---

## 📝 Environment Variables

Make sure these are set in `.env`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## ✅ Success Criteria

- ✅ Configure button opens chat dialog
- ✅ Dialog fetches form schema
- ✅ Natural language prompts work
- ✅ API configuration is generated
- ✅ Configuration is displayed in JSON
- ✅ Configuration updates node schema
- ✅ Success message is shown
- ✅ No console errors

---

## 🎉 Summary

**You can now configure component APIs using natural language chat!**

**Workflow:**
1. Add component to canvas
2. Click Configure button
3. Describe API integration in chat
4. LLM generates configuration
5. Configuration is applied automatically

**This makes API integration:**
- 🚀 **Faster** - No manual JSON writing
- 🎯 **Easier** - Natural language interface
- ✅ **Safer** - Schema-aware validation
- 💡 **Smarter** - AI-powered generation

---

**API Configuration Chat Integration Complete! 🎊**
