import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Users, Eye, Code, Rocket, Star, ArrowRight, Check, Github, Twitter } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [email, setEmail] = useState('')

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thanks for your interest! We\'ll notify you when CollabFlow launches.')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CollabFlow</h1>
                <p className="text-sm text-gray-500">Real-time Collaboration SDK</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <a href="https://github.com/sourabhpunase/collaboration" className="text-gray-600 hover:text-gray-900">
                <Github className="w-5 h-5" />
              </a>
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
                Real-time Collaboration
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Add real-time collaboration to any React app in 2 lines of code. 
                Like Clerk for authentication, but for collaboration. Forever free.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900 text-green-400 p-8 rounded-2xl max-w-4xl mx-auto font-mono text-left mb-12"
            >
              <div className="text-gray-500 text-sm mb-2"># Install</div>
              <div className="text-lg">npm install @collabflow/react</div>
              <br />
              <div className="text-gray-500 text-sm mb-2"># Use anywhere</div>
              <div className="text-lg">{'<CollabFlowProvider publishableKey="pk_live_xxxxx">'}</div>
              <div className="text-lg ml-4">{'<CollabRoom roomId="my-room" />'}</div>
              <div className="text-lg">{'</CollabFlowProvider>'}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all">
                <Rocket className="w-5 h-5" />
                <span>Start Building</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold flex items-center space-x-2 transition-all">
                <Eye className="w-5 h-5" />
                <span>View Demo</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for collaboration
            </h2>
            <p className="text-xl text-gray-600">
              Production-ready features that just work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "2-Line Integration",
                description: "Add real-time collaboration to any React app with just two lines of code. No complex setup required."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Live Cursors",
                description: "See everyone's cursor in real-time. Perfect for collaborative editing and design reviews."
              },
              {
                icon: <Eye className="w-8 h-8" />,
                title: "User Presence",
                description: "Know who's online, who's typing, and who's actively collaborating in your app."
              },
              {
                icon: <Code className="w-8 h-8" />,
                title: "Content Sync",
                description: "Real-time content synchronization across all connected users with conflict resolution."
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Forever Free",
                description: "No limits, no payments, no hidden costs. Open source and free for everyone."
              },
              {
                icon: <Rocket className="w-8 h-8" />,
                title: "Production Ready",
                description: "Built for scale with enterprise-grade features, monitoring, and reliability."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to add real-time collaboration?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers building the future of collaborative apps
          </p>
          
          <Link href="/dashboard" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2">
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CollabFlow</span>
              </div>
              <p className="text-gray-400">
                Real-time collaboration made simple for developers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/examples" className="hover:text-white">Examples</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="https://github.com/sourabhpunase/collaboration" className="text-gray-400 hover:text-white">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CollabFlow. Built with ❤️ for the developer community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}