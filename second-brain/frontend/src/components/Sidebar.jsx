import { Plus, FileText, Globe, Mic, Trash2, Calendar, Tag } from 'lucide-react'

const typeIcons = { document: FileText, web: Globe, audio: Mic, text: FileText, image: FileText }
const typeColors = { document: 'text-blue-400', web: 'text-green-400', audio: 'text-purple-400', text: 'text-yellow-400', image: 'text-pink-400' }

function Sidebar({ isOpen, documents, onUploadClick, onDeleteDocument }) {
  const groupedDocs = documents.reduce((acc, doc) => {
    const date = new Date(doc.createdAt).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(doc)
    return acc
  }, {})

  return (
    <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 glass border-r border-midnight-700/50 transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <button onClick={onUploadClick} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-lg hover:shadow-neon-cyan/20 transition-all font-medium">
            <Plus size={20} /> Add Knowledge
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-xs font-semibold text-midnight-400 uppercase tracking-wider mb-3">Your Memories</h3>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-midnight-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No documents yet</p>
              <p className="text-xs mt-1">Upload files, URLs, or notes to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedDocs).map(([date, docs]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 text-xs text-midnight-400 mb-2"><Calendar size={12} />{date}</div>
                  <div className="space-y-2">
                    {docs.map((doc) => {
                      const Icon = typeIcons[doc.contentType] || FileText
                      const colorClass = typeColors[doc.contentType] || 'text-midnight-300'
                      return (
                        <div key={doc._id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-midnight-800/50 transition-colors cursor-pointer">
                          <div className={`mt-0.5 ${colorClass}`}><Icon size={18} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-midnight-400 truncate">{doc.source}</p>
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Tag size={10} className="text-midnight-500" />
                                <span className="text-xs text-midnight-500">{doc.tags.slice(0, 2).join(', ')}</span>
                              </div>
                            )}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteDocument(doc._id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-midnight-700/50">
          <div className="grid grid-cols-4 gap-2 text-center">
            {Object.entries(typeIcons).map(([type, Icon]) => {
              const count = documents.filter(d => d.contentType === type).length
              const colorClass = typeColors[type]
              return (
                <div key={type} className="p-2 rounded-lg glass">
                  <Icon size={16} className={`mx-auto ${colorClass}`} />
                  <p className="text-xs mt-1 text-midnight-300">{count}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

