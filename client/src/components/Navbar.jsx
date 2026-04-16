import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FileText, LayoutDashboard, Upload, LogOut, LogIn } from 'lucide-react'

export default function Navbar() {
  const { isAuth, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/8">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">
            Resume<span className="text-brand-400">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {isAuth && (
            <>
              <Link
                to="/upload"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/upload')
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload size={15} />
                <span className="hidden sm:inline">Analyze</span>
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={15} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </>
          )}

          {isAuth ? (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-brand-700 rounded-full flex items-center justify-center text-xs font-semibold text-brand-200">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="btn-ghost text-sm py-2 px-4">
                <LogIn size={14} className="inline mr-1.5" />Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
