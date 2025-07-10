# CollabFlow - Free Real-time Collaboration SDK

🚀 **Add real-time collaboration to any React app in 2 lines of code**

A completely free, open-source SDK that provides production-ready real-time collaboration features - like Clerk for authentication, but for collaboration.

## ✨ Features

- 🆓 **Forever Free** - No limits, no payments
- ⚡ **2-Line Integration** - Add to any React app instantly
- 🔄 **Real-time Sync** - Live cursors, content updates, user presence
- 👥 **User Management** - Invitations, permissions, role-based access
- ✅ **Change Review** - Production-grade approval workflows
- 🎯 **Production Ready** - Enterprise features included

## 🚀 Quick Start

### For Developers Using CollabFlow:

```bash
npm install @collabflow/react
```

```jsx
import { CollabFlowProvider, CollabEditor } from '@collabflow/react'

function App() {
  return (
    <CollabFlowProvider>
      <CollabEditor projectId="my-project" />
    </CollabFlowProvider>
  )
}
```

### For Development/Self-hosting:

1. **Start the system:**
   ```bash
   ./start.sh
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

3. **Login as Superadmin:**
   - Email: `superadmin@example.com`
   - Password: `SuperAdmin123!`

## 📦 What's Included

- **SDK Package** (`/sdk`) - React components and hooks
- **Backend API** (`/api`) - Real-time collaboration server
- **Demo App** (`/realtime`) - Full-featured example
- **Documentation** - Integration guides and examples

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│  CollabFlow API │───▶│   Database      │
│  (React/Vue/JS) │    │ (Real-time Hub) │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Backend**: Node.js + Express + Socket.io + Supabase
- **Frontend SDK**: React + TypeScript + Socket.io-client
- **Real-time**: WebSocket connections for live collaboration
- **Storage**: Supabase (PostgreSQL)

## 🚀 Deployment

### Deploy Your Own Instance:

1. **Backend** (Render.com - Free):
   - Go to https://render.com
   - Deploy from GitHub
   - Root directory: `api`

2. **Publish SDK** (npm):
   ```bash
   cd sdk
   npm publish --access public
   ```

3. **Landing Page** (Vercel - Free):
   ```bash
   vercel --prod
   ```

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📚 Documentation

- [SDK Documentation](./sdk/README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [SaaS Implementation](./SAAS_IMPLEMENTATION.md)
- [Launch Checklist](./LAUNCH_CHECKLIST.md)

## 🎯 Use Cases

- **Document Editors** - Google Docs-style collaboration
- **Code Editors** - Real-time pair programming
- **Design Tools** - Collaborative design workflows
- **Project Management** - Team collaboration features
- **Educational Platforms** - Student-teacher interactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - completely free for commercial and personal use.

## 🌟 Support

If this project helps you, please give it a ⭐ on GitHub!

---

**Built with ❤️ for the developer community**