"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Product } from "@/lib/types"
import { Plus, Edit, Trash2, Search, X, Loader2, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const categories = ["All", "Shirts", "Traditional", "Trousers", "Outerwear"]
const SIZES_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', '3XL']

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setProducts(data)
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setIsSaving(true)

    const productData = {
      ...editingProduct,
      price: Number(editingProduct.price || 0),
      sizes: editingProduct.sizes || [],
      images: editingProduct.images || [editingProduct.main_image].filter(Boolean)
    }
    
    // Remove ID if inserting new
    if (!productData.id) delete (productData as any).id

    let error

    if (editingProduct.id) {
      const { error: err } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('products')
        .insert([productData])
      error = err
    }

    if (!error) {
      await fetchProducts()
      setIsModalOpen(false)
      setEditingProduct(null)
      alert("SUCCESS: Piece added to the Ayoka Collection!")
    } else {
      console.error("Save error:", error)
      alert(`DATABASE ERROR: ${error.message}. Ensure you have run the Section 3 SQL in the walkthrough.`)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this piece?")) return
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (!error) fetchProducts()
  }

  const openAddModal = () => {
    setEditingProduct({
      name: '',
      price: 0,
      category: 'Shirts',
      availability: 'In Stock',
      description: '',
      sizes: []
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif italic">Inventory Management</h2>
        <button 
          onClick={openAddModal}
          className="gold-bg text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <input 
          type="text" 
          placeholder="SEARCH BY NAME OR CATEGORY" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 pl-12 pr-4 py-3 text-[10px] uppercase tracking-widest outline-none focus:border-gold-500 transition-colors"
        />
      </div>

      <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900">
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Product</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Category</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Price</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Stock</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={5} className="p-12 text-center text-zinc-500"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : filteredProducts.length === 0 ? (
               <tr><td colSpan={5} className="p-12 text-center text-zinc-500 uppercase tracking-widest text-[10px]">No pieces found.</td></tr>
            ) : filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-zinc-50 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative border border-zinc-100 dark:border-zinc-800">
                      {p.main_image && <img src={p.main_image} alt={p.name} className="object-cover w-full h-full" />}
                    </div>
                    <span className="text-xs font-bold tracking-widest">{p.name}</span>
                  </div>
                </td>
                <td className="p-6 text-[10px] uppercase tracking-widest text-zinc-500">{p.category}</td>
                <td className="p-6 text-[10px] uppercase tracking-widest font-bold">₦ {(p.price || 0).toLocaleString()}</td>
                <td className="p-6">
                   <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                     p.availability === 'In Stock' ? 'bg-green-500/10 text-green-500' : 'bg-gold-500/10 text-gold-500'
                   }`}>
                     {p.availability}
                   </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(p)} className="text-zinc-400 hover:gold-text transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-white dark:bg-black p-10 border border-zinc-100 dark:border-zinc-900 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-serif italic mb-8">{editingProduct.id ? 'Edit Masterpiece' : 'Curate New Piece'}</h3>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Name</label>
                    <input 
                      type="text" 
                      required
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Price (₦)</label>
                    <input 
                      type="number" 
                      required
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Category</label>
                    <select 
                      value={editingProduct.category || 'Shirts'}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500 transition-colors"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Stock Status</label>
                    <select 
                      value={editingProduct.availability || 'In Stock'}
                      onChange={(e) => setEditingProduct({...editingProduct, availability: e.target.value as any})}
                      className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-xs outline-none focus:border-gold-500 transition-colors"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Pre-order">Pre-order</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Product Imagery</label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden group">
                      {editingProduct.main_image ? (
                        <>
                          <img src={editingProduct.main_image} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setEditingProduct({...editingProduct, main_image: ''})}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center space-y-1">
                          <Plus size={16} className="mx-auto text-zinc-400" />
                          <span className="text-[8px] uppercase tracking-tighter text-zinc-500">UPLOAD</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          
                          setIsSaving(true)
                          try {
                            const fileExt = file.name.split('.').pop()
                            const fileName = `${Math.random()}.${fileExt}`
                            const filePath = `${fileName}`

                            const { error: uploadError } = await supabase.storage
                              .from('Products')
                              .upload(filePath, file)

                            if (uploadError) {
                              console.error('Upload error details:', uploadError)
                              alert(`Upload failed: ${uploadError.message}. Ensure you have created a PUBLIC bucket named "Products" in Supabase Storage.`)
                              setIsSaving(false)
                              return
                            }

                            const { data: { publicUrl } } = supabase.storage
                              .from('Products')
                              .getPublicUrl(filePath)
                            
                            setEditingProduct({...editingProduct, main_image: publicUrl})
                          } catch (err: any) {
                            alert(`Error: ${err.message}`)
                          } finally {
                            setIsSaving(false)
                          }
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                       <p className="text-[9px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                         Select a high-resolution image from your device. <br />
                         Recommended: Portrait (3:4) ratio for luxury aesthetic.
                       </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Description</label>
                  <textarea 
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full bg-transparent border border-zinc-100 dark:border-zinc-800 p-3 text-xs outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES_OPTIONS.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const currentSizes = editingProduct.sizes || []
                          const nextSizes = currentSizes.includes(size)
                            ? currentSizes.filter(s => s !== size)
                            : [...currentSizes, size]
                          setEditingProduct({...editingProduct, sizes: nextSizes})
                        }}
                        className={`px-4 py-2 text-[10px] font-bold border transition-all ${
                          editingProduct.sizes?.includes(size)
                            ? "border-gold-500 bg-gold-500 text-white shadow-lg shadow-gold-500/20"
                            : "border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-gold-500 hover:text-zinc-600"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ADD CUSTOM SIZE (E.G. 42 / XL-LONG)..." 
                      className="flex-grow bg-transparent border-b border-zinc-100 dark:border-zinc-800 py-2 text-[10px] outline-none focus:border-gold-500 uppercase tracking-widest"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const val = e.currentTarget.value.trim().toUpperCase()
                          if (val && !editingProduct.sizes?.includes(val)) {
                            setEditingProduct({...editingProduct, sizes: [...(editingProduct.sizes || []), val]})
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.2em] text-[10px] font-bold flex items-center justify-center space-x-2 hover:gold-bg hover:text-white transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    <span>{editingProduct.id ? 'Authorize Updates' : 'Add to Collection'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
