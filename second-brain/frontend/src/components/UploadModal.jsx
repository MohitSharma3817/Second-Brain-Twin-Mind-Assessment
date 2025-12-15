import { useState, useRef } from 'react'
import { X, Upload, Globe, FileText, Mic, Loader2, Check, AlertCircle } from 'lucide-react'
import { api } from '../api'

const tabs = [
  { id: 'file', label: 'File', icon: Upload },
  { id: 'url', label: 'URL', icon: Globe },
  { id: 'text', label: 'Note', icon: FileText },
]

function UploadModal({ onClose, onComplete }) {
  const [activeTab, setActiveTab] = useState('file')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [contentType, setContentType] = useState('document')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!title) setTitle(selectedFile.name)
      const ext = selectedFile.name.split('.').pop().toLowerCase()
      if (['mp3', 'm4a', 'wav', 'ogg', 'flac'].includes(ext)) setContentType('audio')
      else setContentType('document')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (activeTab === 'file') {
        if (!file) throw new Error('Please select a file')
        await api.ingestFile(file, title, contentType, tags)
        setSuccess(`Successfully uploaded ${file.name}`)
      } else if (activeTab === 'url') {
        if (!url) throw new Error('Please enter a URL')
        await api.ingestUrl(url, title, tags.split(',').map(t => t.trim()).filter(Boolean))
        setSuccess(`Successfully ingested URL`)
      } else if (activeTab === 'text') {
        if (!text) throw new Error('Please enter some text')
        await api.ingestText(text, title || 'Text Note', tags.split(',').map(t => t.trim()).filter(Boolean))
        setSuccess(`Successfully saved note`)
      }
      setTimeout(() => onComplete(), 1500)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-midnight-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass rounded-2xl glow overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-midnight-700/50">
          <h2 className="text-lg font-semibold gradient-text">Add Knowledge</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-midnight-700/50 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex border-b border-midnight-700/50">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-neon-cyan border-b-2 border-neon-cyan bg-midnight-800/30' : 'text-midnight-300 hover:text-midnight-100'}`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {activeTab === 'file' && (
            <>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-midnight-600 rounded-xl p-8 text-center cursor-pointer hover:border-neon-cyan/50 transition-colors">
                <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.md,.txt,.mp3,.m4a,.wav,.ogg,.flac" />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    {contentType === 'audio' ? <Mic className="text-neon-purple" size={24} /> : <FileText className="text-neon-cyan" size={24} />}
                    <span className="font-medium">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-3 text-midnight-400" />
                    <p className="text-midnight-300">Click to upload or drag and drop</p>
                    <p className="text-xs text-midnight-500 mt-1">PDF, MD, TXT, MP3, M4A, WAV</p>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-midnight-800 border border-midnight-600 focus:border-neon-cyan focus:outline-none">
                  <option value="document">Document</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'url' && (
            <div>
              <label className="block text-sm font-medium mb-2">Web URL</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className="w-full px-4 py-2.5 rounded-xl bg-midnight-800 border border-midnight-600 focus:border-neon-cyan focus:outline-none" />
            </div>
          )}

          {activeTab === 'text' && (
            <div>
              <label className="block text-sm font-medium mb-2">Note Content</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your note here..." rows={6} className="w-full px-4 py-2.5 rounded-xl bg-midnight-800 border border-midnight-600 focus:border-neon-cyan focus:outline-none resize-none" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give it a memorable name" className="w-full px-4 py-2.5 rounded-xl bg-midnight-800 border border-midnight-600 focus:border-neon-cyan focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (optional)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="work, project, meeting (comma separated)" className="w-full px-4 py-2.5 rounded-xl bg-midnight-800 border border-midnight-600 focus:border-neon-cyan focus:outline-none" />
          </div>

          {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"><AlertCircle size={18} /><span className="text-sm">{error}</span></div>}
          {success && <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400"><Check size={18} /><span className="text-sm">{success}</span></div>}

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neon-cyan/20 transition-all font-medium">
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <><Upload size={18} />Add to Brain</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadModal

