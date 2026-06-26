import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  LineChart,
  BrainCircuit,
  Users,
  HelpCircle,
  LogOut
} from 'lucide-react'

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { path: '/admin/inventory', label: 'Inventory', icon: Package },
  { path: '/admin/analytics', label: 'Analytics', icon: LineChart },
  { path: '/admin/predictions', label: 'Predictions', icon: BrainCircuit },
  { path: '/admin/students', label: 'Users', icon: Users },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 h-screen sticky top-0 flex flex-col transition-all duration-300">
      {/* Brand */}
      <div className="p-6 flex items-center space-x-3 border-b border-gray-800">
        <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-green-900/50">
          Q
        </div>
        <div>
          <p className="text-white font-bold tracking-wide text-lg leading-tight">QLess</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Campus Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
        {NAV.map(n => {
          const Icon = n.icon
          const isActive = location.pathname === n.path || (n.path !== '/admin' && location.pathname.startsWith(n.path))

          return (
            <Link
              key={n.path}
              to={n.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-green-600/10 text-green-500 font-medium'
                  : 'hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'}`} />
              <span>{n.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm">
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        <div className="mt-4 pt-4 border-t border-gray-800/50 flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-300">
            {user?.name?.[0] ?? 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Campus Admin'}</p>
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Super User</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
