import { useState, useEffect } from 'react'
import { getAllUsersAPI } from '@/api/authAPI'
import { Search, Users, UserCheck, ChevronRight } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

const COLOURS = ['#1a6b3a','#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#f97316']

function getColour(name = '') {
  return COLOURS[name.charCodeAt(0) % COLOURS.length] || '#1a6b3a'
}

function getInitials(name = '') {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

function orderTotal(order) {
  const t = Number(order.total ?? 0)
  if (!isNaN(t) && t > 0) return t
  return (order.items ?? []).reduce((acc, i) =>
    acc + Number(i.price ?? 0) * Number(i.qty ?? 1), 0)
}

function formatJoined(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getAllUsersAPI()
      .then((data) => {
        setStudents(data.users || []);
      })
      .catch((err) => console.error("Students fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = students.filter(s => s.active).length

  if (loading) return <div className="p-8 text-gray-500 flex justify-center mt-20">Loading students...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Users</h1>
          <p className="text-gray-500 mt-1 font-sans text-sm">Student accounts derived from order history.</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{activeCount}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-full transition"
        />
      </div>

      <Card className="border-none shadow-sm shadow-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">STUDENT</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">EMAIL</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ORDERS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">TOTAL SPENT</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">FIRST ORDER</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    {students.length === 0 ? 'No orders placed yet — students will appear here once they order.' : 'No students match your search.'}
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: getColour(s.name) }}>
                        {getInitials(s.name)}
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {s.email}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                      {s.orders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-green-700">
                    ₹{s.spent.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatJoined(s.joined)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
