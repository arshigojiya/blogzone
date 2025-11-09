import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiLayout,
  FiUsers,
  FiBookOpen,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiX,
  FiZap
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './AdminLayout.css'

function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/admin/dashboard', icon: FiLayout, label: 'Dashboard' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/blogs', icon: FiBookOpen, label: 'Blogs' },
    { path: '/admin/categories', icon: FiGrid, label: 'Categories' }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <motion.aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FiZap className="logo-icon" />
            {sidebarOpen && <span className="logo-text">BlogZone Admin</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="nav-item-content"
                >
                  <Icon className="nav-icon" />
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </motion.div>
                {active && sidebarOpen && (
                  <motion.div
                    className="active-indicator"
                    layoutId="adminActiveIndicator"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {sidebarOpen && (
              <>
                <div className="user-avatar">
                  <img src={user?.avatar} alt={user?.name} />
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.name}</div>
                  <div className="user-role">Administrator</div>
                </div>
              </>
            )}
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut className="logout-icon" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout

