import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../common/Icon'

const NAV_ITEMS = [
  { path: '/server/dashboard', label: 'Dashboard', icon: 'home' }
]

export default function ServerNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">
      <div className="max-w-[1100px] mx-auto px-8 h-[58px] flex items-center justify-between">
        <Link to="/server/dashboard" className="flex items-center gap-2 font-serif-display text-xl text-brand-green">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-green-mid rounded-[9px] flex items-center justify-center text-white text-base font-bold font-serif-display">Q</div>
          <span>QLess</span>
          <span className="text-xs font-sans text-brand-text-muted ml-2 px-2 py-0.5 bg-brand-green-light rounded-full border border-brand-green/20">Staff</span>
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
          <div className="w-[34px] h-[34px] rounded-full bg-brand-green text-white font-bold text-sm flex items-center justify-center cursor-pointer" title={user?.name}>
            {user?.name?.[0] ?? 'S'}
          </div>
          <button className="bg-transparent border-0 p-2 rounded-full flex transition-colors hover:bg-brand-green-light" onClick={handleLogout} title="Logout">
            <Icon name="logout" size={18} color="var(--text-muted)" />
          </button>
        </div>
      </div>
    </nav>
  )
}
