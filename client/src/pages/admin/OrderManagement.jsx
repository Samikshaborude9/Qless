import { useState, useEffect } from 'react'
import { getAllOrdersAPI, updateOrderStatusAPI } from '@/api/orderAPI'
import useSocket from '@/hooks/useSocket'
import { Search, RefreshCw, ChefHat, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

const FILTERS = ['All Orders', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Picked Up', 'Cancelled']

const STATUS_STYLE = {
  PENDING:   { bg: 'bg-yellow-100', color: 'text-yellow-600', icon: Clock },
  CONFIRMED: { bg: 'bg-blue-100',   color: 'text-blue-600',   icon: Clock },
  PREPARING: { bg: 'bg-amber-100',  color: 'text-amber-600',  icon: Clock },
  READY:     { bg: 'bg-emerald-100',color: 'text-emerald-700',icon: ChefHat },
  PICKED_UP: { bg: 'bg-gray-100',   color: 'text-gray-600',   icon: CheckCircle },
  CANCELLED: { bg: 'bg-red-100',    color: 'text-red-500',    icon: XCircle },
}

const STATUS_FLOW = {
  pending: { next: "confirmed", label: "Confirm" },
  confirmed: { next: "preparing", label: "Prepare" },
  preparing: { next: "ready", label: "Ready" },
  ready: { next: "picked_up", label: "Picked Up" },
  picked_up: null,
  cancelled: null,
}

const COLOURS = ['#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#1a6b3a','#f97316']

function getAvatar(name = '') {
  const parts    = name.trim().split(' ')
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  const colour   = COLOURS[name.charCodeAt(0) % COLOURS.length] || '#1a6b3a'
  return { initials: initials.toUpperCase() || '?', colour }
}

function orderTotal(order) {
  const t = Number(order.totalAmount ?? order.total ?? 0)
  if (!isNaN(t) && t > 0) return t
  return (order.items ?? []).reduce((acc, i) =>
    acc + Number(i.price ?? 0) * Number(i.qty ?? i.quantity ?? 1), 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d   = new Date(dateStr)
  const now = new Date()
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return isToday ? `Today, ${time}` : `${d.toLocaleDateString([], { month:'short', day:'numeric' })}, ${time}`
}

const PAGE_SIZE = 8

export default function OrderManagement() {
  const { on, off } = useSocket()
  const [orders,  setOrders]  = useState([])
  const [filter,  setFilter]  = useState('All Orders')
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [updating, setUpdating] = useState(null)

  const load = () =>
    getAllOrdersAPI()
      .then(data => {
        // Handle different API response shapes gracefully
        setOrders(Array.isArray(data) ? data : (data.orders || []))
      })
      .catch(console.error)
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  // Real-time new orders
  useEffect(() => {
    on("order:new", (order) => {
      setOrders((prev) => [order, ...prev])
      toast.info("🛒 New order received!")
    })
    return () => off("order:new")
  }, [on, off])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await updateOrderStatusAPI(orderId, newStatus)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order marked as ${newStatus.replace("_", " ")}`)
    } catch (error) {
      toast.error("Failed to update order status")
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return
    await handleStatusUpdate(orderId, "cancelled")
  }

  const filtered = orders
    .filter(o => filter === 'All Orders' || (o.status || '').toUpperCase() === filter.replace(' ', '_').toUpperCase())
    .filter(o => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        o._id?.toLowerCase().includes(s) ||
        o.studentName?.toLowerCase().includes(s) ||
        o.userName?.toLowerCase().includes(s) ||
        o.student?.name?.toLowerCase().includes(s) ||
        o.user?.name?.toLowerCase().includes(s) ||
        o.items?.some(i => i.name?.toLowerCase().includes(s))
      )
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const today        = new Date()
  const todayOrders  = orders.filter(o => {
    const d = new Date(o.createdAt)
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth()    === today.getMonth()    &&
           d.getDate()     === today.getDate()
  })
  const todayRevenue = todayOrders.reduce((s, o) => s + orderTotal(o), 0)
  const queued       = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status?.toLowerCase())).length

  if (loading) return <div className="p-8 text-gray-500 flex justify-center mt-20">Loading orders...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">

      {/* Top bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Order Management</h1>
          <p className="text-gray-500 mt-1 font-sans text-sm">Monitor and update live order statuses.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Search ID, student, item..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition"
            />
          </div>
          <button 
            onClick={load} 
            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition shadow-sm text-gray-600 hover:text-green-700 flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide">
          <Tabs value={filter} onValueChange={(v) => { setFilter(v); setPage(1) }}>
            <TabsList className="bg-transparent space-x-2">
              {FILTERS.map(f => (
                <TabsTrigger 
                  key={f} 
                  value={f}
                  className="rounded-full px-5 py-2 data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-md border border-gray-200 data-[state=active]:border-transparent bg-white text-gray-600 hover:bg-gray-50 transition text-sm whitespace-nowrap flex items-center space-x-2"
                >
                  <span>{f}</span>
                  {f !== 'All Orders' && (
                    <span className="opacity-80 text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full">
                      {orders.filter(o => (o.status || '').toUpperCase() === f.replace(' ', '_').toUpperCase()).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-sm shadow-green-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ORDER ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">STUDENT</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ITEMS ORDERED</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">TOTAL</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">DATE & TIME</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : paginated.map(o => {
                const name       = o.student?.name || o.studentName || o.userName || o.user?.name || 'Student'
                const { initials, colour } = getAvatar(name)
                const itemSummary = (o.items ?? []).map(i => `${i.quantity ?? i.qty ?? 1}x ${i.name}`).join(', ')
                const rawStatus = (o.status || 'pending').toLowerCase()
                const displayStatus = rawStatus.replace('_', ' ').toUpperCase()
                const st     = STATUS_STYLE[rawStatus.toUpperCase()] ?? STATUS_STYLE.PENDING
                const StatusIcon = st.icon || Clock
                const flow = STATUS_FLOW[rawStatus]

                return (
                  <tr key={o._id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        #{o._id?.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: colour }}>
                          {initials}
                        </div>
                        <span className="font-medium text-sm text-gray-900">{name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={itemSummary}>
                        {itemSummary || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{orderTotal(o)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${st.bg} ${st.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{displayStatus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {flow && flow.next && (
                          <button 
                            className="px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition border border-green-200 shadow-sm disabled:opacity-50 flex items-center gap-1" 
                            onClick={() => handleStatusUpdate(o._id, flow.next)}
                            disabled={updating === o._id}
                          >
                            {updating === o._id && <RefreshCw className="w-3 h-3 animate-spin" />}
                            {flow.label}
                          </button>
                        )}
                        {!['picked_up', 'cancelled'].includes(rawStatus) && (
                           <button 
                             className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition rounded-lg"
                             title="Cancel Order"
                             onClick={() => handleCancel(o._id)}
                             disabled={updating === o._id}
                           >
                             <XCircle className="w-5 h-5" />
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}</span> to <span className="font-medium text-gray-900">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> orders
            </span>
            <div className="flex items-center space-x-1">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                if (n === 1 || n === totalPages || (n >= page - 1 && n <= page + 1)) {
                  return (
                    <button 
                      key={n}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${page === n ? 'bg-green-700 text-white shadow-sm border border-green-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  )
                }
                if (n === page - 2 || n === page + 2) {
                  return <span key={n} className="px-1 text-gray-400">...</span>
                }
                return null
              })}
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition" 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm shadow-green-100/50 bg-gradient-to-br from-green-800 to-green-900 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <ChefHat className="w-48 h-48 -mr-10 -mt-10" />
          </div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-xl font-bold font-serif mb-2">Live Kitchen Status</h3>
            <p className="text-green-100/80 text-sm mb-6 max-w-lg">
              {queued > 0
                ? `${queued} order${queued !== 1 ? 's' : ''} in the pipeline. Keep an eye on the queue.`
                : 'No orders in the queue right now. Kitchen is clear.'}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold mb-1">{queued}</p>
                <p className="text-xs font-bold text-green-100 tracking-wider uppercase">Orders Queued</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold mb-1">{todayOrders.length}</p>
                <p className="text-xs font-bold text-green-100 tracking-wider uppercase">Orders Today</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold mb-1 text-emerald-300">
                  {orders.filter(o => o.status === 'ready').length}
                </p>
                <p className="text-xs font-bold text-emerald-100 tracking-wider uppercase">Ready for Pickup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-amber-100/50 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">Today's Revenue</p>
            <p className="text-sm text-gray-600 mb-4">
              {todayOrders.length} orders placed today across campus.
            </p>
            <p className="text-4xl font-bold text-amber-600 tracking-tight">
              ₹{todayRevenue.toLocaleString('en-IN')}
            </p>
            <div className="mt-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">Live Data</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
