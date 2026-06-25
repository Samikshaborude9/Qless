import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import Icon from '../common/Icon'

const NAV_ITEMS = [
  { path: '/student/dashboard', label: 'Home',     icon: 'home' },
  { path: '/student/menu',      label: 'Menu',     icon: 'menu' },
  { path: '/student/my-orders',  label: 'Orders',   icon: 'orders' },
  { path: '/student/insights',   label: 'Insights', icon: 'insights' },
]

export default function StudentNav() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">
      <div className="max-w-[1100px] mx-auto px-8 h-[58px] flex items-center justify-between">
        <Link to="/student/dashboard" className="flex items-center gap-2 font-serif-display text-xl text-brand-green">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-green-mid rounded-[9px] flex items-center justify-center text-white text-base font-bold font-serif-display">Q</div>
          <span>QLess</span>
        </Link>

        <div className="flex gap-1">
          {NAV_ITEMS.map(n => {
            const isActive = location.pathname === n.path
            return (
              <Link key={n.path} to={n.path}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border-b-2 transition-all ${
                  isActive 
                    ? "text-brand-green font-bold border-brand-green" 
                    : "text-brand-text-muted border-transparent hover:text-brand-green"
                }`}
              >
                <Icon name={n.icon} size={15} color={isActive ? "var(--green)" : "var(--text-muted)"} />
                {n.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/student/cart" className="relative p-2 rounded-full bg-transparent border-0 cursor-pointer flex hover:bg-brand-green-light">
            <Icon name="cart" size={19} color="var(--green)" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-brand-green text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="bg-transparent border-0 p-2 rounded-full flex transition-colors hover:bg-brand-green-light">
            <Icon name="bell" size={19} color="var(--text-muted)" />
          </button>
          <div className="w-[34px] h-[34px] rounded-full bg-brand-green text-white font-bold text-sm flex items-center justify-center cursor-pointer" title={user?.name}>
            {user?.name?.[0] ?? 'D'}
          </div>
          <button className="bg-transparent border-0 p-2 rounded-full flex transition-colors hover:bg-brand-green-light" onClick={handleLogout} title="Logout">
            <Icon name="logout" size={18} color="var(--text-muted)" />
          </button>
        </div>
      </div>
    </nav>
  )
}
