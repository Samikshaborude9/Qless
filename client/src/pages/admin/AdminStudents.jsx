import { useState, useEffect } from 'react'
import { getAllUsersAPI, createStaffAccountAPI } from '@/api/authAPI'
import { Search, Users, UserCheck, ChevronRight, PlusCircle, X, Shield } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const COLOURS = ['#1a6b3a','#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#f97316']

function getColour(name = '') {
  return COLOURS[name.charCodeAt(0) % COLOURS.length] || '#1a6b3a'
}

function getInitials(name = '') {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

function formatJoined(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function AdminStudents() {
  const [allUsers, setAllUsers] = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [tab, setTab] = useState('students')
  
  const [showModal, setShowModal] = useState(false)
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadUsers = () => {
    setLoading(true)
    getAllUsersAPI()
      .then((data) => {
        setAllUsers(data.users || []);
      })
      .catch((err) => {
        console.error("Users fetch error:", err)
        toast.error("Failed to load users")
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers()
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      return toast.error("Please fill in all fields")
    }
    setSubmitting(true)
    try {
      await createStaffAccountAPI(staffForm.name, staffForm.email, staffForm.password)
      toast.success("Staff account created successfully!")
      setShowModal(false)
      setStaffForm({ name: '', email: '', password: '' })
      loadUsers()
      setTab('staff')
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create staff account")
    } finally {
      setSubmitting(false)
    }
  }

  // Filter based on tab
  const roleFiltered = allUsers.filter(u => {
    if (tab === 'students') return u.role === 'student' || !u.role
    if (tab === 'staff') return u.role === 'server'
    return true
  })

  // Filter based on search
  const filtered = roleFiltered.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = roleFiltered.filter(s => s.active).length

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Users Management</h1>
          <p className="text-gray-500 mt-1 font-sans text-sm">Manage student accounts and canteen staff.</p>
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
              <p className="text-xl font-bold text-gray-900 leading-tight">{roleFiltered.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-transparent space-x-2">
              <TabsTrigger 
                value="students"
                className="rounded-full px-5 py-2 data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-md border border-gray-200 data-[state=active]:border-transparent bg-white text-gray-600 hover:bg-gray-50 transition text-sm whitespace-nowrap"
              >
                Students
              </TabsTrigger>
              <TabsTrigger 
                value="staff"
                className="rounded-full px-5 py-2 data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-md border border-gray-200 data-[state=active]:border-transparent bg-white text-gray-600 hover:bg-gray-50 transition text-sm whitespace-nowrap"
              >
                Canteen Staff
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-full transition"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            New Staff
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-gray-500 flex justify-center mt-20">Loading users...</div>
      ) : (
        <Card className="border-none shadow-sm shadow-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">EMAIL</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ROLE</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">ORDERS</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">TOTAL SPENT</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">JOINED</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                      {roleFiltered.length === 0 ? `No ${tab} found.` : 'No users match your search.'}
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${s.role === 'server' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s.role || 'student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                        {s.orders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-green-700">
                      ₹{(s.spent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatJoined(s.joined)}
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
      )}

      {/* Create Staff Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2 text-gray-800 font-bold">
                    <Shield className="w-5 h-5 text-green-600" />
                    Create Staff Account
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={staffForm.name}
                      onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                      placeholder="e.g. Ramesh Server"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={staffForm.email}
                      onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                      placeholder="ramesh@qless.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <input 
                      type="password"
                      required
                      minLength={6}
                      value={staffForm.password}
                      onChange={e => setStaffForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  
                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
