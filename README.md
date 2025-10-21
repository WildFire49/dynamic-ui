# MiFiX Dynamic UI Platform

A production-ready Next.js application for building dynamic, AI-powered form configurations with conversation history and component library management.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [AI Component Builder](#ai-component-builder)
- [Form Generation Prompts](#form-generation-prompts)
- [Custom Hooks](#custom-hooks)
- [Services](#services)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Development Guide](#development-guide)
- [Deployment](#deployment)

---

## ✨ Features

### 🤖 AI Component Builder
- **Natural Language Form Generation** - Create forms using conversational AI
- **Conversation History** - Track and resume previous sessions
- **Real-time Preview** - See generated forms instantly
- **Schema Validation** - Automatic validation of generated forms

### 📚 Component Library
- **User-Specific Components** - Each user has their own library
- **Drag & Drop** - Intuitive canvas-based form builder
- **Visual Flow** - Connect components to create workflows
- **Live Preview** - Test forms before deployment

### 🎨 Dynamic UI Rendering
- **JSON Schema-Based** - Forms rendered from JSON configurations
- **Material-UI Components** - Professional, responsive design
- **Form Validation** - Built-in validation rules
- **Mock Data** - Test with realistic sample data

---

## 🏗️ Architecture

### Clean Architecture Pattern

```
┌─────────────────────────────────────┐
│         UI Layer (Components)        │
│  - AIComponentBuilder.jsx            │
│  - UIConfiguratorPage.js             │
│  - DynamicUIRenderer.jsx             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Business Logic (Custom Hooks)     │
│  - useAIFormGenerator.js             │
│  - useConversationHistory.js         │
│  - useComponentLibrary.js            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Layer (Services)           │
│  - uiConfiguratorService.js          │
│  - authService.js                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Backend API                 │
└──────────────────────────────────────┘
```

### Design Principles
- ✅ **Separation of Concerns** - UI, Logic, and Data layers separated
- ✅ **Single Responsibility** - Each component has one job
- ✅ **DRY (Don't Repeat Yourself)** - Reusable hooks and services
- ✅ **Error Handling** - Graceful error handling at all layers
- ✅ **Performance** - Optimized with useCallback and useMemo

---

## 📁 Project Structure

```
dynamic-ui/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── configurator/
│   │   │   └── ui/
│   │   │       └── page.js          # UI Configurator page
│   │   └── page.js                  # Home page
│   │
│   ├── components/                   # React components
│   │   ├── configurator/
│   │   │   ├── AIComponentBuilder.jsx    # AI chat interface
│   │   │   ├── ApiConfigDialog.jsx       # API configuration
│   │   │   └── FieldManagerDialog.jsx    # Field management
│   │   ├── dynamic-form/
│   │   │   ├── DynamicUIRenderer.jsx     # Form renderer
│   │   │   ├── DynamicFormRenderer.jsx   # Form logic
│   │   │   └── sampleFormSchemas.js      # Sample schemas
│   │   └── ErrorBoundary.jsx             # Error handling
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAIFormGenerator.js         # Form generation logic
│   │   ├── useConversationHistory.js     # History management
│   │   └── useComponentLibrary.js        # Library management
│   │
│   ├── services/                     # API services
│   │   ├── uiConfiguratorService.js      # UI Configurator API
│   │   └── authService.js                # Authentication
│   │
│   └── contexts/                     # React contexts
│       └── AuthContext.js                # Auth context
│
├── FORM_GENERATION_PROMPTS.txt      # AI prompts for forms
└── README.md                         # This file
```

---

## 🤖 AI Component Builder

### Overview
Chat-based interface for generating forms using natural language.

### Features
- **Natural Language Processing** - Describe forms in plain English
- **Conversation History** - Resume previous sessions
- **Form Preview** - See generated forms instantly
- **Add to Canvas** - Drag generated forms to workflow

### Usage
```jsx
import AIComponentBuilder from '@/components/configurator/AIComponentBuilder';

<AIComponentBuilder onAddToCanvas={handleAddToCanvas} />
```

### Example Prompts
```
"Create a contact form with name and email"
"Add a phone number field to the form"
"Create a loan application with amount and tenure"
```

---

## 📝 Form Generation Prompts

### Location
`/FORM_GENERATION_PROMPTS.txt`

### Available Prompts

#### 1. Applicant Details (13 fields)
- Full Name, DOB, Age, Gender
- Father/Mother Name
- Photos (KYC & Recent)
- Ethnicity, Community, Marital Status
- Educational Qualification

#### 2. KYC Address (8 fields)
- House Number, Street, Locality
- Landmark, VTC, State, District, PIN

#### 3. Contact Information (3 fields)
- Mobile Number
- Alternate Mobile
- Email ID

#### 4. Current Address (9 fields)
- Same as KYC checkbox
- Complete address fields

#### 5. Financial Information (7 fields)
- Country, Bank State, Bank City
- SOL ID, Annual Income
- Profession, Category

#### 6. KYC Documents (8 fields)
- PAN Number
- KYC Type & Document Number
- Issue/Expiry Dates
- Document Images

#### 7. Nominee Details (6 fields)
- Nominee Name & Relationship
- DOB, Age, Address, Contact

### How to Use
1. Open AI Component Builder
2. Copy any prompt from the file
3. Paste into chat
4. AI generates exact JSON schema
5. Click "Add to Canvas"
6. Preview and test

---

## 🎣 Custom Hooks

### useAIFormGenerator()
Handles form generation with conversation context.

```javascript
const {
  loading,              // Generation in progress
  error,                // Error message
  conversationId,       // Current conversation ID
  currentFormId,        // Current form ID
  generateForm,         // Generate/update form
  resetConversation,    // Reset state
  loadConversation      // Load existing conversation
} = useAIFormGenerator();
```

### useConversationHistory()
Manages conversation history with automatic loading.

```javascript
const {
  conversations,      // List of conversations
  loading,            // Loading state
  error,              // Error message
  loadHistory,        // Reload history
  deleteConversation  // Delete a conversation
} = useConversationHistory();
```

### useComponentLibrary()
Manages component library (ready for API, currently uses mock data).

```javascript
const {
  components,         // List of components
  loading,            // Loading state
  error,              // Error message
  loadLibrary,        // Reload library
  refreshLibrary      // Refresh library
} = useComponentLibrary();
```

---

## 🔧 Services

### uiConfiguratorService.js
Centralized API service for all backend communication.

#### Methods

**generateForm({ prompt, userId, conversationId, formId })**
```javascript
const response = await uiConfiguratorService.generateForm({
  prompt: "Create a contact form",
  userId: "user123",
  conversationId: "conv_abc", // optional
  formId: "form_xyz"          // optional
});
```

**getConversationHistory(userId)**
```javascript
const conversations = await uiConfiguratorService.getConversationHistory("user123");
```

**loadConversation(conversationId)**
```javascript
const data = await uiConfiguratorService.loadConversation("conv_abc");
```

**deleteConversation(conversationId)**
```javascript
await uiConfiguratorService.deleteConversation("conv_abc");
```

**getComponentLibrary(userId)** *(Ready for API)*
```javascript
const components = await uiConfiguratorService.getComponentLibrary("user123");
```

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:8000/api/v1/configurator/ui-configurator
```

### 1. Generate Form
```http
POST /generate
Content-Type: application/json

{
  "prompt": "Create a contact form",
  "user_id": "user123",
  "conversation_id": "conv_abc",  // optional
  "form_id": "form_xyz"           // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schema": { /* form schema */ },
    "form_id": "form_xyz",
    "conversation_id": "conv_abc",
    "message": "Form generated successfully"
  }
}
```

### 2. Get Component Library & Conversation History
```http
GET /component-library/{user_id}
```

**Note:** This endpoint returns both component library and conversation history.

**Example:**
```bash
curl --location 'http://localhost:8000/api/v1/configurator/ui-configurator/component-library/vaishakhsk'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "components": [ /* component library */ ],
    "conversations": [ /* conversation history */ ]
  }
}
```

### 3. Load Conversation
```http
GET /conversations/{conversation_id}
```

### 4. Delete Conversation
```http
DELETE /conversations/{conversation_id}
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Upload API URL
NEXT_PUBLIC_UPLOAD_API_URL=https://supervisory-dev.mifix.io/upload

# Event API URL
NEXT_PUBLIC_EVENT_API_URL=http://15.207.209.61:8400/executor/events
```

---

## 💻 Development Guide

### Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Create production build
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing
```bash
# Run tests (when implemented)
npm test
```

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 📖 Additional Resources

### Next.js Documentation
- [Next.js Docs](https://nextjs.org/docs) - Learn about Next.js features
- [Learn Next.js](https://nextjs.org/learn) - Interactive tutorial

### Material-UI
- [MUI Docs](https://mui.com/) - Component library documentation

### React Flow
- [React Flow Docs](https://reactflow.dev/) - Flow diagram library

---

## 🤝 Contributing

1. Follow clean architecture principles
2. Use custom hooks for business logic
3. Keep components focused on UI
4. Add JSDoc comments
5. Write meaningful commit messages

---

## 📄 License

Internal use only - MiFiX AI Platform

---

## 🆘 Troubleshooting

### Issue: Conversations not loading
- Check if user is authenticated
- Verify API endpoint is accessible
- Check browser console for errors

### Issue: Form generation fails
- Verify prompt is not empty
- Check network tab for API errors
- Ensure backend is running

### Issue: Component library empty
- Currently using mock data
- API integration ready but not active
- Check `loadComponentLibrary` function

---

**Built with ❤️ using Next.js, Material-UI, and React Flow**
