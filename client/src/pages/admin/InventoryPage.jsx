import { useState, useEffect, useCallback } from 'react'
import { getInventoryAPI, getLowStockAPI, updateStockAPI, addIngredientAPI, deleteIngredientAPI } from '@/api/inventoryAPI'
import { Search, RefreshCw, AlertTriangle, TrendingDown, Package, Lightbulb, Plus, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import useSocket from "@/hooks/useSocket"

const PRED = "http://localhost:5001/api"

const RECIPE_MAP = {
  "Masala Dosa":        [{ name:"Rice",qty:.1},{ name:"Urad Dal",qty:.03},{ name:"Potato",qty:.1},{ name:"Oil",qty:.02}],
  "Poha":               [{ name:"Poha",qty:.1},{ name:"Potato",qty:.05},{ name:"Onion",qty:.05},{ name:"Oil",qty:.01}],
  "Medu Vada":          [{ name:"Urad Dal",qty:.08},{ name:"Onion",qty:.03},{ name:"Oil",qty:.03}],
  "Uttappa":            [{ name:"Rice",qty:.1},{ name:"Urad Dal",qty:.03},{ name:"Onion",qty:.05},{ name:"Tomato",qty:.05},{ name:"Oil",qty:.01}],
  "Dhokla":             [{ name:"Chana Dal",qty:.1},{ name:"Curd",qty:.05},{ name:"Oil",qty:.01}],
  "Sabudana Vada":      [{ name:"Sabudana",qty:.08},{ name:"Potato",qty:.06},{ name:"Oil",qty:.03}],
  "Aloo Paratha":       [{ name:"Wheat Flour",qty:.08},{ name:"Potato",qty:.1},{ name:"Butter",qty:.02}],
  "Tea":                [{ name:"Tea Leaves",qty:.005},{ name:"Milk",qty:.1},{ name:"Sugar",qty:.01}],
  "Dal Khichdi":        [{ name:"Rice",qty:.1},{ name:"Moong Dal",qty:.06},{ name:"Butter",qty:.01}],
  "Matar Paneer":       [{ name:"Paneer",qty:.1},{ name:"Matar (Peas)",qty:.08},{ name:"Tomato",qty:.1},{ name:"Onion",qty:.06},{ name:"Oil",qty:.02}],
  "Bhindi Masala":      [{ name:"Bhindi",qty:.15},{ name:"Onion",qty:.05},{ name:"Tomato",qty:.05},{ name:"Oil",qty:.02}],
  "Veg Biryani":        [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Onion",qty:.05},{ name:"Oil",qty:.02}],
  "Paneer Biryani":     [{ name:"Rice",qty:.15},{ name:"Paneer",qty:.1},{ name:"Onion",qty:.05},{ name:"Oil",qty:.02}],
  "Misal Pav":          [{ name:"Moth Beans",qty:.1},{ name:"Pav",qty:2},{ name:"Onion",qty:.05},{ name:"Oil",qty:.02}],
  "Pav Bhaji":          [{ name:"Potato",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Pav",qty:2},{ name:"Butter",qty:.02},{ name:"Tomato",qty:.08}],
  "Dal Tadka":          [{ name:"Toor Dal",qty:.1},{ name:"Tomato",qty:.05},{ name:"Onion",qty:.04},{ name:"Oil",qty:.02}],
  "Veg Bhuna":          [{ name:"Mixed Veg",qty:.15},{ name:"Tomato",qty:.08},{ name:"Onion",qty:.06},{ name:"Oil",qty:.02}],
  "Veg Pulav":          [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Oil",qty:.02}],
  "Mushroom":           [{ name:"Mushroom",qty:.15},{ name:"Onion",qty:.05},{ name:"Tomato",qty:.05},{ name:"Oil",qty:.02}],
  "Samosa":             [{ name:"Wheat Flour",qty:.06},{ name:"Potato",qty:.08},{ name:"Oil",qty:.03}],
  "Samosa Chaat":       [{ name:"Wheat Flour",qty:.06},{ name:"Potato",qty:.08},{ name:"Curd",qty:.05},{ name:"Oil",qty:.03}],
  "Vada Pav":           [{ name:"Potato",qty:.1},{ name:"Pav",qty:1},{ name:"Chana Dal",qty:.03},{ name:"Oil",qty:.03}],
  "Sandwich":           [{ name:"Bread",qty:2},{ name:"Cheese",qty:.03},{ name:"Mixed Veg",qty:.08},{ name:"Butter",qty:.01}],
  "Schezwan Rice":      [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.08},{ name:"Schezwan Sauce",qty:.04},{ name:"Oil",qty:.02},{ name:"Soy Sauce",qty:.01},{ name:"Spring Onion",qty:.03}],
  "Hakka Noodles":      [{ name:"Noodles",qty:.1},{ name:"Cabbage",qty:.06},{ name:"Capsicum",qty:.05},{ name:"Soy Sauce",qty:.02},{ name:"Oil",qty:.02}],
  "Fried Rice":         [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.08},{ name:"Soy Sauce",qty:.02},{ name:"Oil",qty:.02}],
  "Manchurian Rice":    [{ name:"Rice",qty:.15},{ name:"Mixed Veg",qty:.1},{ name:"Soy Sauce",qty:.02},{ name:"Schezwan Sauce",qty:.03},{ name:"Oil",qty:.02}],
  "Manchurian Noodles": [{ name:"Noodles",qty:.1},{ name:"Mixed Veg",qty:.08},{ name:"Soy Sauce",qty:.02},{ name:"Schezwan Sauce",qty:.03},{ name:"Oil",qty:.02}],
}

const CATEGORIES = ["all","grain","vegetable","dairy","spice","beverage","oil","other"]
const UNITS = ["kg", "g", "litre", "ml", "pieces", "packets"]

const EMPTY_FORM = {
  name: "",
  category: "other",
  currentStock: "",
  unit: "kg",
  lowStockThreshold: "",
  notes: "",
}

const STATUS = (item) => {
  const stock = item.currentStock || 0
  const threshold = item.lowStockThreshold || 1
  const pct = stock / threshold

  if (stock <= 0)  return { label: "OUT",      color: "text-red-500", bg: "bg-red-100", bar: "bg-red-500" }
  if (pct <= 1)    return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-100", bar: "bg-red-500" }
  if (pct <= 2)    return { label: "LOW",      color: "text-amber-600", bg: "bg-amber-100", bar: "bg-amber-500" }
  if (pct <= 4)    return { label: "OK",       color: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-500" }
  return                  { label: "GOOD",     color: "text-emerald-600", bg: "bg-emerald-100", bar: "bg-emerald-500" }
}

export default function InventoryPage() {
  const { on, off } = useSocket()
  const [inventory,    setInventory]    = useState([])
  const [predictions,  setPredictions]  = useState([])
  const [shortages,    setShortages]    = useState([])
  const [alerts,       setAlerts]       = useState([])
  const [tab,          setTab]          = useState("all")
  const [search,       setSearch]       = useState("")
  
  // Add/Edit Form state
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)

  // Inline edit state
  const [editing,      setEditing]      = useState(null)
  const [editVal,      setEditVal]      = useState({})
  
  const [loading,      setLoading]      = useState(true)
  const [predLoading,  setPredLoading]  = useState(true)
  const [saving,       setSaving]       = useState(false)

  const loadInventory = useCallback(async () => {
    try {
      const data = await getInventoryAPI()
      setInventory(Array.isArray(data.inventory) ? data.inventory : (Array.isArray(data) ? data : []))
      
      const alertData = await getLowStockAPI()
      setAlerts(Array.isArray(alertData.alerts) ? alertData.alerts : (Array.isArray(alertData) ? alertData : []))
    } catch (e) { 
      console.error("Inventory fetch error:", e) 
    } finally { 
      setLoading(false) 
    }
  }, [])

  const loadPredictions = useCallback(async () => {
    try {
      const res  = await fetch(`${PRED}/predict/day`)
      const data = await res.json()
      setPredictions(data.slots ?? [])
    } catch {
      setPredictions([])
    } finally { setPredLoading(false) }
  }, [])

  useEffect(() => { loadInventory(); loadPredictions() }, [loadInventory, loadPredictions])

  useEffect(() => {
    on("stock:low", (data) => {
      toast.warning(`⚠️ Low stock: ${data.ingredientName}`)
      loadInventory() // Refresh to update alerts
    })
    return () => off("stock:low")
  }, [on, off, loadInventory])

  useEffect(() => {
    if (!predictions.length || !inventory.length) return
    const now     = new Date()
    const curSlot = Math.max(0, Math.min(25, (now.getHours() - 8) * 2 + (now.getMinutes() >= 30 ? 1 : 0)))
    const future  = predictions.filter(s => s.slot_index >= curSlot)

    const dishDemand = {}
    future.forEach(slot => {
      ;(slot.predictions ?? []).forEach(p => {
        dishDemand[p.dish] = (dishDemand[p.dish] ?? 0) + (p.predicted_orders ?? 0)
      })
    })

    const needed = {}
    Object.entries(dishDemand).forEach(([dish, orders]) => {
      const recipe = RECIPE_MAP[dish] ?? []
      recipe.forEach(({ name, qty }) => {
        needed[name] = (needed[name] ?? 0) + qty * orders
      })
    })

    const result = []
    inventory.forEach(ing => {
      const req = needed[ing.name] ?? 0
      if (req === 0) return
      const stock = ing.currentStock || 0
      const threshold = ing.lowStockThreshold || 1
      const remaining = stock - req
      
      if (remaining < threshold) {
        result.push({
          ...ing,
          neededToday: +req.toFixed(2),
          projectedRemaining: +remaining.toFixed(2),
          shortfall: remaining < 0 ? +(-remaining).toFixed(2) : 0,
          severity: remaining < 0 ? "critical" : "warning",
        })
      }
    })

    result.sort((a, b) => a.projectedRemaining - b.projectedRemaining)
    setShortages(result)
  }, [predictions, inventory])

  const filtered = inventory.filter(i => {
    if (!i || !i.name) return false
    return (tab === "all" || i.category === tab) && i.name.toLowerCase().includes(search.toLowerCase())
  })

  // Inline Quick Save
  const saveQuickEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const payload = { currentStock: Number(editVal.stock), lowStockThreshold: Number(editVal.threshold) }
      const updated = await updateStockAPI(editing._id, payload)
      const newItem = updated.ingredient || updated
      setInventory(prev => prev.map(i => i._id === editing._id ? { ...i, ...payload, ...newItem } : i))
      setEditing(null)
      toast.success("Stock updated quickly")
      loadInventory()
    } catch (e) { 
      toast.error("Save failed") 
    } finally { 
      setSaving(false) 
    }
  }

  // Full Form Save
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const name = (form.name || "").trim()
    const currentStock = form.currentStock === "" ? NaN : Number(form.currentStock)
    const lowStockThreshold = form.lowStockThreshold === "" ? NaN : Number(form.lowStockThreshold)

    if (!name || Number.isNaN(currentStock) || Number.isNaN(lowStockThreshold)) {
      toast.error("Please fill in valid numbers and name")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name,
        category: form.category || "other",
        currentStock,
        unit: form.unit,
        lowStockThreshold,
        notes: form.notes || "",
      }

      if (editItem) {
        const updated = await updateStockAPI(editItem._id, payload)
        const newItem = updated.ingredient || updated
        setInventory(prev => prev.map(item => item._id === editItem._id ? { ...item, ...payload, ...newItem } : item))
        toast.success("Ingredient updated!")
      } else {
        const data = await addIngredientAPI(payload)
        setInventory(prev => [data.ingredient || data, ...prev])
        toast.success("Ingredient added!")
      }
      setShowModal(false)
      loadInventory() // Refresh alerts
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save ingredient")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return
    setDeleting(id)
    try {
      await deleteIngredientAPI(id)
      setInventory(prev => prev.filter(item => item._id !== id))
      toast.success("Ingredient deleted")
      loadInventory()
    } catch (error) {
      toast.error("Failed to delete ingredient")
    } finally {
      setDeleting(null)
    }
  }

  const openAddModal = () => {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openFullEditModal = (item) => {
    setEditItem(item)
    setForm({
      name: item.name,
      category: item.category || 'other',
      currentStock: item.currentStock,
      unit: item.unit || 'kg',
      lowStockThreshold: item.lowStockThreshold,
      notes: item.notes || "",
    })
    setShowModal(true)
  }

  const criticalCount = inventory.filter(i => STATUS(i).label === "CRITICAL" || STATUS(i).label === "OUT").length
  const lowCount      = inventory.filter(i => STATUS(i).label === "LOW").length
  const totalCost     = inventory.reduce((s, i) => s + (i.currentStock || 0) * (i.costPerUnit || 0), 0)

  if (loading && inventory.length === 0) return <div className="p-8 text-gray-500 flex justify-center mt-20">Loading inventory...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Inventory Management</h1>
          <p className="text-gray-500 mt-1 font-sans text-sm">Real-time stock levels, alerts, and demand-based shortage forecasts.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={() => { setLoading(true); loadInventory(); loadPredictions() }}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm shadow-gray-100">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Items</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card className={`border-none shadow-sm transition-all duration-300 ${criticalCount > 0 ? 'bg-red-50/50 shadow-red-100' : 'shadow-gray-100'}`}>
          <CardContent className="p-5">
            <p className={`text-xs font-bold uppercase tracking-wider ${criticalCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>Critical / Out</p>
            <p className={`text-3xl font-bold mt-2 ${criticalCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className={`border-none shadow-sm transition-all duration-300 ${lowCount > 0 ? 'bg-amber-50/50 shadow-amber-100' : 'shadow-gray-100'}`}>
          <CardContent className="p-5">
            <p className={`text-xs font-bold uppercase tracking-wider ${lowCount > 0 ? 'text-amber-500' : 'text-gray-400'}`}>Low Stock</p>
            <p className={`text-3xl font-bold mt-2 ${lowCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{lowCount}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-gray-100">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Predicted Shortages</p>
            <p className={`text-3xl font-bold mt-2 ${shortages.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {predLoading ? "..." : shortages.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm shadow-gray-100">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inventory Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹{Math.round(totalCost).toLocaleString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Stock table */}
        <Card className="lg:col-span-2 border-none shadow-sm shadow-green-100/50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search ingredient..." 
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-full transition"
              />
            </div>
            <div className="w-full md:w-auto overflow-x-auto pb-1 scrollbar-hide">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="bg-transparent space-x-1">
                  {CATEGORIES.map(c => (
                    <TabsTrigger 
                      key={c} 
                      value={c}
                      className="rounded-full px-4 py-1.5 data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-sm border border-gray-200 data-[state=active]:border-transparent bg-white text-gray-600 hover:bg-gray-50 transition text-xs whitespace-nowrap capitalize"
                    >
                      {c}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Threshold</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Bar</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => {
                  const st  = STATUS(item)
                  const pct = Math.min(100, ((item.currentStock || 0) / ((item.lowStockThreshold || 1) * 5)) * 100)
                  const isCritical = st.label === "CRITICAL" || st.label === "OUT"
                  
                  return (
                    <tr key={item._id} className={`hover:bg-gray-50/50 transition group ${isCritical ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-4 font-semibold text-gray-900 text-sm">
                        {item.name}
                        {item.notes && <p className="text-[10px] text-gray-500 font-normal mt-0.5">{item.notes}</p>}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 capitalize">{item.category}</td>
                      <td className="px-5 py-4 text-sm text-gray-800">
                        {editing?._id === item._id ? (
                          <input 
                            type="number" step="0.1" 
                            value={editVal.stock}
                            onChange={e => setEditVal(p => ({ ...p, stock: e.target.value }))}
                            className="w-20 px-2 py-1 text-sm border border-green-500 rounded focus:outline-none focus:ring-1 focus:ring-green-500" 
                          />
                        ) : (
                          <span className="font-bold">{item.currentStock} <span className="text-gray-500 text-xs font-normal">{item.unit}</span></span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {editing?._id === item._id ? (
                          <input 
                            type="number" step="0.1" 
                            value={editVal.threshold}
                            onChange={e => setEditVal(p => ({ ...p, threshold: e.target.value }))}
                            className="w-20 px-2 py-1 text-sm border border-green-500 rounded focus:outline-none focus:ring-1 focus:ring-green-500" 
                          />
                        ) : (
                          <span>{item.lowStockThreshold} <span className="text-gray-400 text-xs">{item.unit}</span></span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${st.bg} ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 w-32">
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${st.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {editing?._id === item._id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-sm transition" onClick={saveQuickEdit} disabled={saving}>
                              {saving ? "..." : "Save"}
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition" onClick={() => setEditing(null)}>✕</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition">
                            <button 
                              className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded"
                              title="Quick Edit Stock"
                              onClick={() => { setEditing(item); setEditVal({ stock: item.currentStock, threshold: item.lowStockThreshold }) }}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded"
                              title="Full Edit"
                              onClick={() => openFullEditModal(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete Item"
                              onClick={() => handleDelete(item._id)}
                              disabled={deleting === item._id}
                            >
                              {deleting === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RIGHT: Alerts + Shortage Predictions */}
        <div className="space-y-6">

          {/* Current alerts */}
          <Card className="border-none shadow-sm shadow-red-100/50">
            <CardHeader className="pb-2 border-b border-gray-50 flex flex-row justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-bold text-gray-800">Stock Alerts</CardTitle>
              </div>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{alerts.length}</span>
            </CardHeader>
            <CardContent className="pt-4">
              {alerts.length === 0 ? (
                <p className="text-sm font-medium text-emerald-600 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>All ingredients above threshold</span>
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {alerts.map(a => {
                    const st = STATUS(a)
                    return (
                      <div key={a._id} className={`flex justify-between items-start p-3 rounded-lg border bg-white ${st.label === "OUT" ? 'border-red-200 shadow-sm shadow-red-100/50' : 'border-amber-200 shadow-sm shadow-amber-100/50'}`}>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{a.currentStock} {a.unit} remaining <span className="opacity-50">·</span> threshold {a.lowStockThreshold} {a.unit}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}>{st.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shortage predictions */}
          <Card className="border-none shadow-sm shadow-amber-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <TrendingDown className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2 border-b border-gray-50 flex flex-row justify-between items-center relative z-10">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔮</span>
                <CardTitle className="text-lg font-bold text-gray-800">Predicted Shortages</CardTitle>
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                {predLoading ? "..." : `${shortages.length} at risk`}
              </span>
            </CardHeader>
            <CardContent className="pt-4 relative z-10">
              <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded border border-gray-100">
                {predLoading
                  ? "Fetching demand forecast..."
                  : predictions.length === 0
                  ? "⚠️ Prediction server offline — start Flask on port 5001"
                  : "Based on today's demand forecast from your ML model."}
              </p>

              {!predLoading && shortages.length === 0 && predictions.length > 0 && (
                <p className="text-sm font-medium text-emerald-600 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>No shortages predicted for today</span>
                </p>
              )}

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {shortages.map(s => (
                  <div key={s._id} className={`p-3 rounded-lg border-l-4 bg-white shadow-sm ${s.severity === "critical" ? 'border-l-red-500 border-gray-100' : 'border-l-amber-500 border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-sm text-gray-900">{s.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${s.severity === "critical" ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {s.severity === "critical" ? "Shortage" : "At Risk"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-600">Current: <span className="font-semibold text-gray-900">{s.currentStock} {s.unit}</span></span>
                      <span className="text-gray-600">Needed: <span className="font-semibold text-gray-900">{s.neededToday} {s.unit}</span></span>
                    </div>
                    {s.shortfall > 0 && (
                      <p className="text-xs font-semibold text-red-600 mb-2">Shortfall: {s.shortfall} {s.unit}</p>
                    )}
                    <p className={`text-[11px] leading-tight ${s.severity === "critical" ? 'text-red-500' : 'text-amber-600'}`}>
                      {s.severity === "critical"
                        ? `Restock at least ${s.shortfall} ${s.unit} before the next rush.`
                        : `Will drop below threshold. Consider restocking soon.`}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {shortages.length > 0 && (
            <Card className="border-none shadow-sm shadow-green-100/50 bg-green-50/50 border border-green-100">
              <CardHeader className="pb-2 flex flex-row items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <CardTitle className="text-sm font-bold text-green-900">Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {shortages.slice(0, 4).map(s => {
                    const toOrder = Math.ceil(s.shortfall > 0 ? s.shortfall + s.lowStockThreshold : s.lowStockThreshold)
                    return (
                      <li key={s._id} className="text-sm text-gray-700 flex items-start space-x-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>
                          Order <span className="font-bold text-gray-900">{toOrder} {s.unit}</span> of <span className="font-bold text-gray-900">{s.name}</span>
                          {s.costPerUnit > 0 && (
                            <span className="text-green-700 font-medium text-xs ml-1 bg-green-100 px-1.5 py-0.5 rounded">
                              ≈ ₹{Math.ceil(toOrder * s.costPerUnit)}
                            </span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="font-bold text-lg text-gray-900">
                    {editItem ? "Update Ingredient" : "Add Ingredient"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      placeholder="e.g. Rice"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition appearance-none capitalize"
                      >
                        {CATEGORIES.filter(c => c !== 'all').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Unit</label>
                      <select
                        name="unit"
                        value={form.unit}
                        onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition appearance-none"
                      >
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Current Stock
                      </label>
                      <input
                        name="currentStock"
                        type="number"
                        step="0.01"
                        value={form.currentStock}
                        onChange={e => setForm(p => ({ ...p, currentStock: e.target.value }))}
                        required
                        min="0"
                        placeholder="50"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Low Alert At
                      </label>
                      <input
                        name="lowStockThreshold"
                        type="number"
                        step="0.01"
                        value={form.lowStockThreshold}
                        onChange={e => setForm(p => ({ ...p, lowStockThreshold: e.target.value }))}
                        required
                        min="0"
                        placeholder="10"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Notes (optional)
                    </label>
                    <input
                      name="notes"
                      value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Supplier details..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 mt-2 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {submitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {editItem ? "Save Changes" : "Add Ingredient"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
