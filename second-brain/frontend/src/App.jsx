import { useState, useEffect } from 'react'
import { Brain, Menu, X } from 'lucide-react'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import UploadModal from './components/UploadModal'
import { api } from './api'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({ documentsCount: 0 })

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await api.getHealth()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  useEffect(() => {
    fetchDocuments()
    fetchStats()
  }, [])

  const handleUploadComplete = () => {
    fetchDocuments()
    fetchStats()
    setUploadModalOpen(false)
  }

  const handleDeleteDocument = async (id) => {
    try {
      await api.deleteDocument(id)
      fetchDocuments()
      fetchStats()
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  return (
    <div className="min-h-screen neural-bg">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-midnight-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-midnight-700/50 transition-colors lg:hidden">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-neon-cyan" />
              <h1 className="text-xl font-semibold gradient-text">Second Brain</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
              <span className="text-sm text-midnight-200">{stats.documentsCount} memories</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} documents={documents} onUploadClick={() => setUploadModalOpen(true)} onDeleteDocument={handleDeleteDocument} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
          <ChatInterface />
        </main>
      </div>

      {uploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} onComplete={handleUploadComplete} />}
    </div>
  )
}

export default App

