import { useState } from 'react'
import { Code, Copy, Check, Zap, Users, Settings, Book, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function Docs() {
  const [copiedCode, setCopiedCode] = useState('')

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const CodeBlock = ({ code, language = 'jsx', id }: { code: string, language?: string, id: string }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <span className="text-sm text-gray-400">{language}</span>
        <button
          onClick={() => copyCode(code, id)}
          className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm"
        >
          {copiedCode === id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedCode === id ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">CollabFlow</span>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Documentation</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="sticky top-8 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#installation" className="text-blue-600 hover:text-blue-800">Installation</a></li>
                  <li><a href="#quick-start" className="text-gray-600 hover:text-gray-900">Quick Start</a></li>
                  <li><a href="#api-keys" className="text-gray-600 hover:text-gray-900">API Keys</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Components</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#provider" className="text-gray-600 hover:text-gray-900">CollabFlowProvider</a></li>
                  <li><a href="#room" className="text-gray-600 hover:text-gray-900">CollabRoom</a></li>
                  <li><a href="#hooks" className="text-gray-600 hover:text-gray-900">Hooks</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Examples</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#nextjs" className="text-gray-600 hover:text-gray-900">Next.js</a></li>
                  <li><a href="#typescript" className="text-gray-600 hover:text-gray-900">TypeScript</a></li>
                  <li><a href="#custom" className="text-gray-600 hover:text-gray-900">Custom Integration</a></li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-blue max-w-none">
              {/* Hero */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
                <h1 className="text-4xl font-bold mb-4">CollabFlow Documentation</h1>
                <p className="text-xl text-blue-100 mb-6">
                  Add real-time collaboration to any React app in 2 lines of code
                </p>
                <div className="flex items-center space-x-4">
                  <Link href="/signup" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                    Get Started Free
                  </Link>
                  <a href="https://github.com/sourabhpunase/collaboration" className="text-white hover:text-blue-100 flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>View on GitHub</span>
                  </a>
                </div>
              </div>

              {/* Installation */}
              <section id="installation" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Installation</h2>
                <p className="text-gray-600 mb-6">
                  Install the CollabFlow React SDK using npm or yarn:
                </p>
                <CodeBlock 
                  code="npm install @collabflow/react" 
                  language="bash" 
                  id="install-npm"
                />
                <div className="mt-4">
                  <CodeBlock 
                    code="yarn add @collabflow/react" 
                    language="bash" 
                    id="install-yarn"
                  />
                </div>
              </section>

              {/* Quick Start */}
              <section id="quick-start" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start</h2>
                <p className="text-gray-600 mb-6">
                  Get started with CollabFlow in just 2 steps:
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Step 1: Get Your API Key</h3>
                  <p className="text-blue-800 mb-4">
                    Sign up at <Link href="/signup" className="underline">collabflow.com</Link> to get your publishable API key.
                  </p>
                  <div className="bg-white rounded border p-3">
                    <code className="text-sm text-blue-600">pk_live_your_api_key_here</code>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Add to Your React App</h3>
                <CodeBlock 
                  code={`import { CollabFlowProvider, CollabRoom } from '@collabflow/react'

function App() {
  return (
    <CollabFlowProvider publishableKey="pk_live_your_api_key_here">
      <div className="my-app">
        <h1>My Application</h1>
        
        {/* Add real-time collaboration anywhere */}
        <CollabRoom roomId="document-123" />
      </div>
    </CollabFlowProvider>
  )
}`}
                  id="quick-start-code"
                />

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
                  <h4 className="font-semibold text-green-900 mb-2">🎉 That's it!</h4>
                  <p className="text-green-800">
                    Your app now has real-time collaboration with live cursors, content sync, and user presence.
                  </p>
                </div>
              </section>

              {/* API Keys */}
              <section id="api-keys" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">API Keys</h2>
                <p className="text-gray-600 mb-6">
                  CollabFlow uses publishable API keys to authenticate your application:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Publishable Key</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Safe to use in your frontend code
                    </p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">pk_live_...</code>
                  </div>
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Secret Key</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Keep secure on your backend only
                    </p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">sk_live_...</code>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Note:</strong> Never expose your secret key in client-side code. Only use publishable keys in your React app.
                  </p>
                </div>
              </section>

              {/* Provider */}
              <section id="provider" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">CollabFlowProvider</h2>
                <p className="text-gray-600 mb-6">
                  The CollabFlowProvider component wraps your app and provides real-time collaboration context.
                </p>

                <CodeBlock 
                  code={`import { CollabFlowProvider } from '@collabflow/react'

function App() {
  return (
    <CollabFlowProvider 
      publishableKey="pk_live_your_api_key"
      options={{
        // Optional configuration
        baseUrl: "https://api.collabflow.com",
        debug: false
      }}
    >
      <YourApp />
    </CollabFlowProvider>
  )
}`}
                  id="provider-code"
                />

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Props</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Prop</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Required</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm font-mono text-blue-600">publishableKey</td>
                        <td className="px-4 py-2 text-sm text-gray-600">string</td>
                        <td className="px-4 py-2 text-sm text-gray-600">Yes</td>
                        <td className="px-4 py-2 text-sm text-gray-600">Your CollabFlow publishable API key</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm font-mono text-blue-600">options</td>
                        <td className="px-4 py-2 text-sm text-gray-600">object</td>
                        <td className="px-4 py-2 text-sm text-gray-600">No</td>
                        <td className="px-4 py-2 text-sm text-gray-600">Optional configuration</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* CollabRoom */}
              <section id="room" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">CollabRoom</h2>
                <p className="text-gray-600 mb-6">
                  The CollabRoom component provides a complete real-time collaboration interface.
                </p>

                <CodeBlock 
                  code={`import { CollabRoom } from '@collabflow/react'

function MyComponent() {
  return (
    <CollabRoom 
      roomId="document-123"
      className="h-96 border rounded-lg"
      showCursors={true}
      showUsers={true}
    />
  )
}`}
                  id="room-code"
                />

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Features</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                  <li>Live cursor tracking for all connected users</li>
                  <li>Real-time content synchronization</li>
                  <li>User presence indicators</li>
                  <li>Connection status display</li>
                  <li>Customizable styling</li>
                </ul>
              </section>

              {/* Hooks */}
              <section id="hooks" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Hooks</h2>
                <p className="text-gray-600 mb-6">
                  Use CollabFlow hooks for custom integrations and advanced use cases.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">useCollabFlow</h3>
                <CodeBlock 
                  code={`import { useCollabFlow } from '@collabflow/react'

function MyComponent() {
  const { 
    createRoom, 
    joinRoom, 
    leaveRoom,
    isConnected,
    currentRoom 
  } = useCollabFlow()

  const handleCreateRoom = async () => {
    const room = await createRoom({
      name: "My Room",
      description: "Collaborative workspace"
    })
    console.log('Room created:', room)
  }

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleCreateRoom}>
        Create Room
      </button>
    </div>
  )
}`}
                  id="hooks-code"
                />

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">useCursors</h3>
                <CodeBlock 
                  code={`import { useCursors } from '@collabflow/react'

function CursorTracker() {
  const { cursors, trackCursor } = useCursors()

  const handleMouseMove = (e) => {
    trackCursor(e.clientX, e.clientY)
  }

  return (
    <div onMouseMove={handleMouseMove} className="relative h-96">
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute w-4 h-4 rounded-full"
          style={{
            left: cursor.x,
            top: cursor.y,
            backgroundColor: cursor.user.color
          }}
        />
      ))}
    </div>
  )
}`}
                  id="cursors-code"
                />
              </section>

              {/* Next.js Example */}
              <section id="nextjs" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Next.js Integration</h2>
                <p className="text-gray-600 mb-6">
                  Here's how to integrate CollabFlow with a Next.js application:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">pages/_app.js</h3>
                <CodeBlock 
                  code={`import { CollabFlowProvider } from '@collabflow/react'

export default function App({ Component, pageProps }) {
  return (
    <CollabFlowProvider publishableKey={process.env.NEXT_PUBLIC_COLLABFLOW_KEY}>
      <Component {...pageProps} />
    </CollabFlowProvider>
  )
}`}
                  id="nextjs-app"
                />

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">pages/editor.js</h3>
                <CodeBlock 
                  code={`import { CollabRoom } from '@collabflow/react'

export default function Editor() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Collaborative Editor</h1>
      <CollabRoom 
        roomId="editor-room"
        className="h-96 border rounded-lg"
      />
    </div>
  )
}`}
                  id="nextjs-editor"
                />

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Environment Variables</h3>
                <CodeBlock 
                  code={`# .env.local
NEXT_PUBLIC_COLLABFLOW_KEY=pk_live_your_api_key_here`}
                  language="bash"
                  id="nextjs-env"
                />
              </section>

              {/* Support */}
              <section className="bg-gray-100 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
                <p className="text-gray-600 mb-6">
                  Get support and connect with the CollabFlow community:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="https://github.com/sourabhpunase/collaboration" className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <Book className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">GitHub</h3>
                      <p className="text-sm text-gray-600">Issues & discussions</p>
                    </div>
                  </a>
                  <Link href="/dashboard" className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <Settings className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Dashboard</h3>
                      <p className="text-sm text-gray-600">Manage your account</p>
                    </div>
                  </Link>
                  <a href="mailto:support@collabflow.com" className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Support</h3>
                      <p className="text-sm text-gray-600">Get direct help</p>
                    </div>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}