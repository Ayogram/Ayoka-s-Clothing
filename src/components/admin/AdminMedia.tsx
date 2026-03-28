"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash2, Search, X, Loader2, Save, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const platforms = ["Instagram", "TikTok", "Facebook"]

export default function AdminMedia() {
  const [media, setMedia] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMedia(data)
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      ...editingMedia,
      likes: parseInt(editingMedia.likes) || 0,
      comments: parseInt(editingMedia.comments) || 0
    }

    try {
      if (payload.id) {
        const { error } = await supabase.from('media').update(payload).eq('id', payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('media').insert([payload])
        if (error) throw error
      }
      
      await fetchMedia()
      setIsModalOpen(false)
      setEditingMedia(null)
      alert("Social masterpiece saved successfully.")
    } catch (err: any) {
      console.error("Save Error:", err.message)
      alert(`Save failed: ${err.message}. (Note: Ensure you have run the SQL script provided in the implementation plan to add engagement columns)`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this post?")) return
    await supabase.from('media').delete().eq('id', id)
    fetchMedia()
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif italic">Social Media Hub</h2>
        <button 
          onClick={() => {
            setEditingMedia({ platform: 'Instagram', url: '', link: '', caption: '', type: 'image', likes: 62, comments: 2 })
            setIsModalOpen(true)
          }}
          className="gold-bg text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <Plus size={16} />
          <span>Add Social Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-gold-500" /></div>
        ) : media.map((item) => (
          <div key={item.id} className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 group relative">
            <div className="aspect-square relative overflow-hidden">
               <img src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
               <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 text-[8px] uppercase font-bold text-white tracking-widest">
                 {item.platform}
               </div>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex items-center space-x-6 text-[8px] uppercase tracking-widest font-bold text-zinc-400 mb-2">
                 <span>{item.likes || 0} Likes</span>
                 <span>{item.comments || 0} Comments</span>
               </div>
               <p className="text-[10px] text-zinc-500 line-clamp-2 uppercase tracking-widest leading-relaxed">{item.caption}</p>
               <div className="flex justify-between items-center pt-4 border-t border-zinc-50 dark:border-zinc-900">
                  <a href={item.link} target="_blank" className="text-[9px] uppercase tracking-widest gold-text font-bold flex items-center space-x-2">
                    <ExternalLink size={12} />
                    <span>View Post</span>
                  </a>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => {
                        setEditingMedia(item)
                        setIsModalOpen(true)
                      }} 
                      className="text-zinc-300 hover:text-gold-500 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && editingMedia && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-black p-10 border border-zinc-100 dark:border-zinc-900 shadow-2xl relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-serif italic mb-8">Post Details</h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Platform</label>
                    <select 
                      value={editingMedia.platform}
                      onChange={(e) => setEditingMedia({...editingMedia, platform: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500"
                    >
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Content Type</label>
                    <select 
                      value={editingMedia.type}
                      onChange={(e) => setEditingMedia({...editingMedia, type: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Media File</label>
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
                       {editingMedia.url ? <img src={editingMedia.url} className="w-full h-full object-cover" /> : <Plus size={16} className="text-zinc-400" />}
                       <input 
                         type="file" 
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         onChange={async (e) => {
                           const file = e.target.files?.[0]
                           if (!file) return
                           setIsSaving(true)
                           try {
                             const { data, error } = await supabase.storage.from('Media').upload(`${Math.random()}-${file.name}`, file)
                             if (error) {
                               alert(`Upload failed: ${error.message}. Ensure you have created a PUBLIC bucket named "Media" in Supabase Storage.`)
                               setIsSaving(false)
                               return
                             }
                             if (data) {
                               const { data: { publicUrl } } = supabase.storage.from('Media').getPublicUrl(data.path)
                               setEditingMedia({...editingMedia, url: publicUrl})
                             }
                           } catch (err: any) {
                             alert(`Error: ${err.message}`)
                           } finally {
                             setIsSaving(false)
                           }
                         }}
                       />
                    </div>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest">Select Image or Video</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Likes Count</label>
                    <input 
                      type="number" 
                      value={editingMedia.likes || 0}
                      onChange={(e) => setEditingMedia({...editingMedia, likes: parseInt(e.target.value)})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Comments Count</label>
                    <input 
                      type="number" 
                      value={editingMedia.comments || 0}
                      onChange={(e) => setEditingMedia({...editingMedia, comments: parseInt(e.target.value)})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Post/Content Link</label>
                  <input 
                    type="text" 
                    placeholder="https://instagram.com/p/..."
                    value={editingMedia.link}
                    onChange={(e) => setEditingMedia({...editingMedia, link: e.target.value})}
                    className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Caption</label>
                  <textarea 
                    rows={2}
                    value={editingMedia.caption}
                    onChange={(e) => setEditingMedia({...editingMedia, caption: e.target.value})}
                    className="w-full bg-transparent border border-zinc-100 dark:border-zinc-800 p-3 text-xs outline-none focus:border-gold-500"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.2em] text-[10px] font-bold flex items-center justify-center space-x-2 hover:gold-bg hover:text-white transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>Save to Feed</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
