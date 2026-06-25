import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getDashboardStatsAPI } from '@/api/dashboardAPI'
import { Bell, AlertTriangle, Package, DollarSign, TrendingUp, ArchiveX, ListOrdered } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const STATUS_STYLE = {
  PENDING:   { bg: 'bg-yellow-100', color: 'text-yellow-600' },
  PREPARING: { bg: 'bg-amber-100', color: 'text-amber-600' },
  READY:     { bg: 'bg-emerald-100', color: 'text-emerald-700' },
  COMPLETED: { bg: 'bg-gray-100', color: 'text-gray-600' },
  CANCELLED: { bg: 'bg-red-100', color: 'text-red-500' },
}

const COLOURS = ['#f59e0b','#3b82f6','#8b5cf6','#ec4899','#10b981','#1a6b3a','#f97316']

function avatarProps(name = '') {
  const parts    = name.trim().split(' ')
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  const colour   = COLOURS[name.charCodeAt(0) % COLOURS.length] || '#1a6b3a'
  return { initials: initials.toUpperCase() || '?', colour }
}

function orderTotal(order) {
  const t = Number(order.total ?? order.totalAmount ?? 0)
  if (!isNaN(t) && t > 0) return t
  return (order.items ?? []).reduce((acc, i) => {
    return acc + Number(i.price ?? 0) * Number(i.qty ?? i.quantity ?? 1)
  }, 0)
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [insightDismissed, setInsightDismissed] = useState(false)

  const load = () => {
    return getDashboardStatsAPI()
      .then(res => setStats(res.stats))
      .catch(console.error)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  if (loading || !stats) return <div className="p-8 text-gray-500 flex justify-center mt-20">Loading dashboard...</div>

  const { totalOrders, todayRevenue, topItem, highDemand, unavailableItems, recentOrders } = stats

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 font-sans">Welcome back, {user?.name ?? 'Chef Commander'}.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-white rounded-full shadow-sm hover:shadow transition relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.[0] ?? 'A'}
            </div>
            <span className="font-medium text-gray-800 pr-2">{user?.name ?? 'Admin'}</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm shadow-green-100 hover:shadow-md transition">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-700 mb-4">
                <ListOrdered className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Today</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-green-100 hover:shadow-md transition">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-700 mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Today</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">₹{todayRevenue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-green-100 hover:shadow-md transition">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{topItem?.[1] ?? 0} portions</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Top Selling</p>
            <p className="text-xl font-bold text-gray-900 mt-1 truncate">{topItem?.[0] ?? '—'}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-red-100 hover:shadow-md transition">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Unavailable</p>
            <p className={`text-2xl font-bold mt-1 ${unavailableItems.length ? 'text-red-500' : 'text-green-700'}`}>
              {unavailableItems.length} Items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-none shadow-sm shadow-green-100/50">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-lg font-bold text-gray-800">Recent Orders</CardTitle>
            <Link to="/admin/orders" className="text-sm font-medium text-green-700 hover:text-green-800">View All</Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-gray-500">ORDER ID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500">USER</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500">ITEMS</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500">PRICE</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 text-right">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map(o => {
                      const { initials, colour } = avatarProps(o.user?.name ?? o.userName ?? '')
                      const itemSummary = (o.items ?? []).map(i => `${i.qty ?? i.quantity ?? 1}x ${i.name}`).join(', ')
                      const status = (o.status ?? 'PREPARING').toUpperCase()
                      const st = STATUS_STYLE[status] ?? STATUS_STYLE.PREPARING
                      return (
                        <TableRow key={o._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <TableCell className="font-medium text-sm text-gray-900">#{o._id?.slice(-6).toUpperCase()}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{backgroundColor: colour}}>
                                {initials}
                              </div>
                              <span className="text-sm text-gray-700 whitespace-nowrap">{o.user?.name ?? o.userName ?? 'Student'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">{itemSummary || '—'}</TableCell>
                          <TableCell className="text-sm font-semibold text-gray-800">₹{orderTotal(o)}</TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
                              {status}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Col */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm shadow-green-100/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-800">High Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highDemand.length === 0
                  ? <p className="text-gray-500 text-sm">No order data yet.</p>
                  : highDemand.map(d => (
                    <div key={d.name} className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
                        🍲
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.name}</p>
                          <p className="text-xs font-medium text-green-700">{d.pct}% Popular</p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${d.pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
              <Link to="/admin/menu">
                <button className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                  Manage Full Menu
                </button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm shadow-red-100/50">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="text-lg font-bold text-gray-800">Unavailable Items</CardTitle>
              <ArchiveX className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unavailableItems.length === 0
                  ? <p className="text-green-700 text-sm font-medium">All items available ✓</p>
                  : unavailableItems.map(s => (
                    <div key={s._id} className="flex justify-between items-center p-3 rounded-lg border border-red-100 bg-red-50/50">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.category || s.cat}</p>
                      </div>
                      <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full">Out of Stock</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!insightDismissed && (
        <div className="mt-8 bg-gradient-to-r from-green-800 to-green-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between relative overflow-hidden transition-all duration-300">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <TrendingUp className="w-48 h-48 -mr-10 -mt-10" />
          </div>
          <div className="flex-1 mb-4 md:mb-0 relative z-10">
            <span className="inline-block px-2 py-1 bg-green-700/50 text-green-100 text-xs font-bold rounded uppercase tracking-wider mb-2">Pro Insight</span>
            <h3 className="text-xl font-bold mb-1">
              {topItem ? `${topItem[0]} is your top seller today.` : 'Kitchen is running smoothly.'}
            </h3>
            <p className="text-green-100/80 text-sm max-w-xl">
              {topItem
                ? `${topItem[0]} has been ordered ${topItem[1]} times today. Consider preparing extra stock for the lunch rush.`
                : 'No orders yet today. Make sure the menu is up to date and available items are marked correctly.'}
            </p>
          </div>
          <div className="flex items-center space-x-3 relative z-10 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-white text-green-900 text-sm font-semibold rounded-xl hover:bg-green-50 transition shadow-sm">
              Launch Promotion
            </button>
            <button 
              className="px-4 py-2.5 bg-green-800/50 hover:bg-green-700/50 text-white text-sm font-medium rounded-xl transition"
              onClick={() => setInsightDismissed(true)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
