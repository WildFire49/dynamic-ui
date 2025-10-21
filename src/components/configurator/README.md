# AI Component Builder - Architecture Documentation

## Overview
The AI Component Builder is a production-ready React component that generates forms using natural language with full conversation history support. It follows modern frontend best practices with proper separation of concerns.

## Architecture

### 📁 File Structure
```
src/
├── components/
│   └── configurator/
│       ├── AIComponentBuilder.jsx      # Main UI component
│       └── README.md                   # This file
├── hooks/
│   ├── useConversationHistory.js      # Conversation history management
│   └── useAIFormGenerator.js          # Form generation logic
└── services/
    └── uiConfiguratorService.js       # API service layer
```

## Components

### 1. **AIComponentBuilder.jsx**
Main UI component responsible for:
- Rendering chat interface
- Managing message display
- Handling user interactions
- Coordinating between hooks

**Props:**
- `onAddToCanvas(component)` - Callback when form is added to canvas

**State:**
- `messages` - Chat message history
- `input` - Current user input
- `historyDrawerOpen` - History drawer visibility

### 2. **Custom Hooks**

#### `useComponentLibrary()`
Manages component library with automatic loading from backend.

**Returns:**
```javascript
{
  components: Array,         // List of components
  loading: boolean,          // Loading state
  error: string|null,        // Error message
  loadLibrary: Function,     // Reload library
  refreshLibrary: Function   // Refresh library
}
```

**Features:**
- Auto-loads on mount
- User-specific components
- Error handling with retry
- Empty state support

#### `useConversationHistory()`
Manages conversation history with automatic loading.

**Returns:**
```javascript
{
  conversations: Array,      // List of conversations
  loading: boolean,          // Loading state
  error: string|null,        // Error message
  loadHistory: Function,     // Reload history
  deleteConversation: Function // Delete a conversation
}
```

**Features:**
- Auto-loads on mount
- Handles errors gracefully
- Optimistic UI updates

#### `useAIFormGenerator()`
Handles form generation with conversation context.

**Returns:**
```javascript
{
  loading: boolean,              // Generation in progress
  error: string|null,            // Error message
  conversationId: string|null,   // Current conversation ID
  currentFormId: string|null,    // Current form ID
  generateForm: Function,        // Generate/update form
  resetConversation: Function,   // Reset state
  loadConversation: Function     // Load existing conversation
}
```

**Features:**
- Automatic conversation tracking
- Form ID management
- Success/error callbacks
- State persistence

### 3. **Service Layer**

#### `uiConfiguratorService.js`
Centralized API service for all backend communication.

**Methods:**

##### `generateForm({ prompt, userId, conversationId, formId })`
Generate or update a form.
```javascript
const response = await uiConfiguratorService.generateForm({
  prompt: "Create a contact form",
  userId: "user123",
  conversationId: "conv_abc", // optional
  formId: "form_xyz"          // optional
});
```

##### `getConversationHistory(userId)`
Fetch user's conversation history.
```javascript
const conversations = await uiConfiguratorService.getConversationHistory("user123");
```

##### `loadConversation(conversationId)`
Load a specific conversation with all messages.
```javascript
const data = await uiConfiguratorService.loadConversation("conv_abc");
```

##### `deleteConversation(conversationId)`
Delete a conversation.
```javascript
await uiConfiguratorService.deleteConversation("conv_abc");
```

##### `getComponentLibrary(userId)`
Get component library for a user.
```javascript
const components = await uiConfiguratorService.getComponentLibrary("user123");
```

## Data Flow

```
User Input
    ↓
AIComponentBuilder (UI)
    ↓
useAIFormGenerator (Business Logic)
    ↓
uiConfiguratorService (API Layer)
    ↓
Backend API
    ↓
Response Processing
    ↓
UI Update
```

## API Endpoints

### Base URL
```
http://localhost:8000/api/v1/configurator/ui-configurator
```

### Endpoints

#### 1. Generate Form
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

#### 2. Get Conversation History
```http
GET /conversations?user_id=user123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "conv_abc",
        "title": "Contact Form",
        "preview": "Create a contact form with...",
        "message_count": 5,
        "updated_at": "2025-10-14T10:00:00Z"
      }
    ]
  }
}
```

#### 3. Load Conversation
```http
GET /conversations/{conversation_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_abc",
    "current_form_id": "form_xyz",
    "messages": [
      {
        "role": "user",
        "content": "Create a contact form",
        "timestamp": "2025-10-14T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "Form generated",
        "schema": { /* form schema */ },
        "form_id": "form_xyz",
        "timestamp": "2025-10-14T10:00:01Z"
      }
    ]
  }
}
```

#### 4. Delete Conversation
```http
DELETE /conversations/{conversation_id}
```

#### 5. Get Component Library
```http
GET /component-library/{user_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "components": [
      {
        "id": "comp_123",
        "name": "Customer Information Form",
        "description": "Complete customer details",
        "category": "onboarding",
        "icon": "person",
        "color": "#1976d2",
        "estimated_time": "5-7 mins",
        "fields_count": 45,
        "sections_count": 7,
        "schema": { /* form schema */ }
      }
    ]
  }
}
```

## Best Practices Implemented

### ✅ Separation of Concerns
- **UI Layer**: Components focus only on rendering
- **Business Logic**: Custom hooks handle state and logic
- **Data Layer**: Services handle API communication

### ✅ Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages
- Graceful degradation

### ✅ Performance Optimization
- `useCallback` for stable function references
- `useMemo` where appropriate
- Optimistic UI updates

### ✅ Code Organization
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Clear naming conventions
- Comprehensive JSDoc comments

### ✅ User Experience
- Loading states
- Error feedback
- Keyboard shortcuts (Enter to send)
- Auto-scroll to latest message
- Responsive design

## Usage Example

```jsx
import AIComponentBuilder from '@/components/configurator/AIComponentBuilder';

function MyPage() {
  const handleAddToCanvas = (component) => {
    console.log('Adding to canvas:', component);
    // Add component to your canvas
  };

  return (
    <AIComponentBuilder onAddToCanvas={handleAddToCanvas} />
  );
}
```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Testing Considerations

### Unit Tests
- Test custom hooks independently
- Mock service layer
- Test error scenarios

### Integration Tests
- Test component with mocked API
- Verify conversation flow
- Test history management

### E2E Tests
- Full user journey
- Form generation
- Conversation loading

## Future Enhancements

1. **Offline Support**: Cache conversations locally
2. **Real-time Updates**: WebSocket for live collaboration
3. **Export/Import**: Download conversation history
4. **Search**: Search through conversations
5. **Tags**: Categorize conversations
6. **Sharing**: Share generated forms

## Troubleshooting

### Common Issues

**Issue**: Conversations not loading
- Check if user is authenticated
- Verify API endpoint is accessible
- Check browser console for errors

**Issue**: Form generation fails
- Verify prompt is not empty
- Check network tab for API errors
- Ensure backend is running

**Issue**: History drawer empty
- Ensure user has created conversations
- Check API response in network tab
- Verify user_id is correct

## Contributing

When adding new features:
1. Update service layer first
2. Create/update custom hooks
3. Update UI component
4. Add JSDoc comments
5. Update this README

## License

Internal use only - MiFiX AI Platform
