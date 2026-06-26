import { useState, useEffect } from 'react'
import { getMenuImage } from '@/lib/menuImages'
import { getMenuAPI, addMenuItemAPI, updateMenuItemAPI, deleteMenuItemAPI } from '@/api/menuAPI'
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = ['All Items', 'Breakfast', 'Lunch', 'Snacks']

export default function MenuManagement() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('All Items')
  const [search,   setSearch]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [toggling, setToggling] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getMenuAPI()
      .then(data => {
        setItems(Array.isArray(data) ? data : (data.menuItems || data.items || []))
      })
      .catch(err => {
        console.error(err)
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(m =>
    (tab === 'All Items' || (m.cat || m.category)?.toLowerCase() === tab.toLowerCase()) &&
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleAvail = async (item) => {
    const isAvail = item.available !== undefined ? item.available : item.isAvailable;
    const newVal = !isAvail;
    setItems(prev => prev.map(i => i._id === item._id ? { ...i, available: newVal, isAvailable: newVal } : i))
    setToggling(prev => ({ ...prev, [item._id]: true }))
    try {
      await updateMenuItemAPI(item._id, { available: newVal, isAvailable: newVal })
    } catch {
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, available: isAvail, isAvailable: isAvail } : i))
    } finally {
      setToggling(prev => ({ ...prev, [item._id]: false }))
    }
  }

  const openAdd = () => {
    setEditItem(null)
    setEditForm({ name: '', price: '', cat: 'snacks', desc: '', available: true, stock: 0, prepTime: 10, image: '' })
    setShowModal(true)
  }

  const openEdit = item => {
    setEditItem(item)
    setEditForm({ 
      ...item,
      cat: (item.cat || item.category || 'snacks').toLowerCase(),
      available: item.available !== undefined ? item.available : item.isAvailable,
      stock: item.stock !== undefined ? item.stock : 0,
      prepTime: item.prepTime !== undefined ? item.prepTime : 10,
      image: item.image || ''
    })
    setShowModal(true)
  }

  const closeEdit = () => {
    setEditItem(null)
    setShowModal(false)
  }

  const saveEdit = async () => {
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('name', editForm.name)
      payload.append('price', Number(editForm.price))
      payload.append('cat', editForm.cat.toLowerCase())
      payload.append('category', editForm.cat.toLowerCase())
      payload.append('desc', editForm.desc || editForm.description || '')
      payload.append('description', editForm.desc || editForm.description || '')
      payload.append('available', editForm.available)
      payload.append('isAvailable', editForm.available)
      payload.append('stock', Number(editForm.stock))
      payload.append('prepTime', Number(editForm.prepTime))
      
      if (editForm.image instanceof File) {
        payload.append('image', editForm.image)
      } else if (typeof editForm.image === 'string') {
        payload.append('image', editForm.image)
      }

      if (editItem) {
        const updated = await updateMenuItemAPI(editItem._id, payload)
        // If the API doesn't return the full updated item, just optimistically merge
        const updatedItem = updated.menuItem || updated
        setItems(prev => prev.map(i => i._id === editItem._id ? { ...i, ...updatedItem } : i))
      } else {
        const data = await addMenuItemAPI(payload)
        const newItem = data.menuItem || data
        setItems(prev => [newItem, ...prev])
      }
      closeEdit()
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return
    await deleteMenuItemAPI(id)
    setItems(prev => prev.filter(i => i._id !== id))
  }

  if (loading) return <div className="p-8 text-gray-500 flex justify-center mt-20">Loading menu...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Menu Management</h1>
          <p className="text-gray-500 mt-1 font-sans">Manage food items, pricing, and daily availability across campus.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by food name..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 transition"
          />
        </div>
      </div>

      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-transparent space-x-2">
            {TABS.map(t => (
              <TabsTrigger 
                key={t} 
                value={t}
                className="rounded-full px-6 py-2 data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-md border border-gray-200 data-[state=active]:border-transparent bg-white text-gray-600 hover:bg-gray-50 transition"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(item => {
          const isAvail = item.available !== undefined ? item.available : item.isAvailable;
          const category = item.cat || item.category || '';
          
          return (
            <Card key={item._id} className={`overflow-hidden transition-all duration-300 border-none shadow-sm hover:shadow-md ${!isAvail ? 'opacity-75 grayscale-[0.2]' : ''}`}>
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={item.image || getMenuImage(item.name)} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'
                  }}
                />
                <div className="absolute top-3 left-3 flex flex-col space-y-2">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {category.toUpperCase()}
                  </span>
                  {!isAvail && (
                    <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <p className="font-bold text-gray-900 text-lg leading-tight flex-1 pr-2">{item.name}</p>
                  <p className="font-bold text-green-700 text-lg">₹{item.price}</p>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isAvail ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className={`text-xs font-bold tracking-wide ${isAvail ? 'text-green-700' : 'text-gray-500'}`}>
                      {isAvail ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </span>
                  </div>
                  
                  <label className={`relative inline-flex items-center cursor-pointer ${toggling[item._id] ? 'opacity-50' : ''}`}>
                    <input type="checkbox" className="sr-only peer" checked={isAvail} disabled={!!toggling[item._id]} onChange={() => toggleAvail(item)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => openEdit(item)}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <button onClick={openAdd} className="fixed bottom-8 right-8 w-14 h-14 bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-800 hover:scale-105 transition-transform z-10">
        <Plus className="w-6 h-6" />
      </button>

      {/* Edit/Add Panel Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
                <p className="text-sm text-gray-500 mt-1">{editItem ? 'Update menu details & stock' : 'Add a new item to the menu'}</p>
              </div>
              <button onClick={closeEdit} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</label>
                <input 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => setEditForm(p => ({ ...p, image: e.target.files[0] }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                />
                {typeof editForm.image === 'string' && editForm.image && (
                  <p className="text-xs text-gray-500 mt-1">Current image: <a href={editForm.image} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all">Link</a></p>
                )}
              </div>

              <div className="flex space-x-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editForm.price || ''} 
                    onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select 
                    value={editForm.cat || 'snacks'} 
                    onChange={e => setEditForm(p => ({ ...p, cat: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition appearance-none capitalize"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                    <option value="beverages">Beverages</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                  <input 
                    type="number" 
                    value={editForm.stock ?? ''} 
                    onChange={e => setEditForm(p => ({ ...p, stock: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                    min="0"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prep Time (mins)</label>
                  <input 
                    type="number" 
                    value={editForm.prepTime ?? ''} 
                    onChange={e => setEditForm(p => ({ ...p, prepTime: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea 
                  rows={3} 
                  value={editForm.desc || editForm.description || ''} 
                  onChange={e => setEditForm(p => ({ ...p, desc: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center mt-6">
                <div>
                  <p className="font-semibold text-gray-900">Available for Orders</p>
                  <p className="text-xs text-gray-500 mt-0.5">Visible to students on the app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={editForm.available !== false}
                    onChange={e => setEditForm(p => ({ ...p, available: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex space-x-3 bg-white">
              <button 
                onClick={closeEdit}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Discard
              </button>
              <button 
                onClick={saveEdit}
                disabled={submitting}
                className="flex-[2] py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition shadow-sm disabled:opacity-70 flex justify-center items-center"
              >
                {submitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Add Item')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
