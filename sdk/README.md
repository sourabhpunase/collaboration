# @collabflow/react

Real-time collaboration SDK - Like Clerk for project management

## 🚀 Quick Start

```bash
npm install @collabflow/react
```

```jsx
import { CollabFlowProvider, CollabEditor, ReviewPanel } from '@collabflow/react'

function App() {
  return (
    <CollabFlowProvider apiKey="cf_live_xxxxx">
      <div className="grid grid-cols-2 gap-4">
        <CollabEditor projectId="proj_123" />
        <ReviewPanel projectId="proj_123" />
      </div>
    </CollabFlowProvider>
  )
}
```

## 📦 Components

### `<CollabFlowProvider>`
Wraps your app with real-time collaboration context.

```jsx
<CollabFlowProvider 
  apiKey="cf_live_xxxxx"
  baseUrl="https://api.collabflow.com" // optional
>
  <YourApp />
</CollabFlowProvider>
```

### `<CollabEditor>`
Drop-in collaborative text editor.

```jsx
<CollabEditor 
  projectId="proj_123"
  className="custom-editor"
/>
```

### `<ReviewPanel>`
Admin interface for reviewing changes.

```jsx
<ReviewPanel 
  projectId="proj_123"
  className="review-sidebar"
/>
```

## 🎣 Hooks

### `useCollabFlow()`
Access collaboration functions.

```jsx
const { 
  createProject, 
  inviteUsers, 
  reviewChanges,
  approveChange,
  rejectChange,
  isLoading 
} = useCollabFlow()

// Create project
const project = await createProject({
  name: "My Project",
  description: "Real-time collaboration"
})

// Invite users
await inviteUsers(project.id, ['user1', 'user2'])

// Review changes
const changes = await reviewChanges(project.id)

// Approve/reject
await approveChange(changeId, "Looks good!")
await rejectChange(changeId, "Needs revision")
```

## 🔑 API Keys

Get your API key from [dashboard.collabflow.com](https://dashboard.collabflow.com)

- **Development**: `cf_test_xxxxx`
- **Production**: `cf_live_xxxxx`

## 🆓 Completely Free

- **Forever Free**: Unlimited projects, unlimited users
- **Open Source**: MIT License, contribute on GitHub
- **No Limits**: All features included

## 📚 Examples

### Next.js Integration
```jsx
// pages/_app.js
import { CollabFlowProvider } from '@collabflow/react'

export default function App({ Component, pageProps }) {
  return (
    <CollabFlowProvider apiKey={process.env.NEXT_PUBLIC_COLLABFLOW_KEY}>
      <Component {...pageProps} />
    </CollabFlowProvider>
  )
}

// pages/editor.js
import { CollabEditor } from '@collabflow/react'

export default function Editor() {
  return <CollabEditor projectId="proj_123" />
}
```

### Custom Integration
```jsx
import { useCollabFlow } from '@collabflow/react'

function CustomComponent() {
  const { createProject, isLoading } = useCollabFlow()
  
  const handleCreate = async () => {
    const project = await createProject({
      name: "New Document",
      description: "Collaborative editing"
    })
    console.log('Created:', project)
  }
  
  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Project'}
    </button>
  )
}
```

## 🛠️ TypeScript Support

Full TypeScript support included:

```typescript
import { CollabFlowProvider, useCollabFlow, Project } from '@collabflow/react'

const MyComponent: React.FC = () => {
  const { createProject } = useCollabFlow()
  
  const handleCreate = async (): Promise<Project> => {
    return await createProject({
      name: "Typed Project",
      description: "With full type safety"
    })
  }
  
  return <button onClick={handleCreate}>Create</button>
}
```

## 🔗 Links

- [Dashboard](https://dashboard.collabflow.com)
- [Documentation](https://docs.collabflow.com)
- [Examples](https://github.com/collabflow/examples)
- [Support](mailto:support@collabflow.com)