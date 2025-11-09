import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiHome, 
  FiBookOpen, 
  FiGrid, 
  FiUser, 
  FiMail,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiZap,
  FiLogIn,
  FiLogOut,
  FiSettings
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar({ isDark, toggleTheme }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navLinks = [
    { name: 'Home', icon: FiHome, path: '/' },
    { name: 'Blogs', icon: FiBookOpen, path: '/blogs' },
    { name: 'Categories', icon: FiGrid, path: '/categories' },
    { name: 'About', icon: FiUser, path: '/about' },
    { name: 'Contact', icon: FiMail, path: '/contact' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      x: '100%',
      transition: { duration: 0.3 }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: '100%',
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Link to="/">
        <motion.div 
          className="navbar-logo"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiZap className="logo-icon" />
          <span>BlogZone</span>
        </motion.div>
      </Link>

      <motion.ul 
        className="navbar-links"
        variants={containerVariants}
      >
        {navLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link.path)
          return (
            <motion.li 
              key={link.path}
              variants={itemVariants}
            >
              <Link
                to={link.path}
                className={active ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Icon className="nav-icon" />
                  <span>{link.name}</span>
                  {active && (
                    <motion.div
                      className="active-indicator"
                      layoutId="activeIndicator"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            </motion.li>
          )
        })}
      </motion.ul>

      <div className="navbar-actions">
        {user ? (
          <>
            {isAdmin && (
              <Link to="/admin/dashboard">
                <motion.button
                  className="admin-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Admin Dashboard"
                >
                  <FiSettings />
                </motion.button>
              </Link>
            )}
            <Link to="/profile">
              <motion.button
                className="profile-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Profile"
              >
                <FiUser />
              </motion.button>
            </Link>
            <motion.button
              className="logout-btn"
              onClick={() => {
                logout()
                navigate('/')
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Logout"
            >
              <FiLogOut />
            </motion.button>
          </>
        ) : (
          <Link to="/login">
            <motion.button
              className="login-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Login"
            >
              <FiLogIn />
              <span>Login</span>
            </motion.button>
          </Link>
        )}

        <motion.button 
          className="theme-toggle"
          onClick={toggleTheme}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiSun />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiMoon />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button 
          className="hamburger"
          onClick={toggleMobileMenu}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiX />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FiMenu />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />
            <motion.div
              className="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="mobile-menu-content">
              {navLinks.map((link, index) => {
                const Icon = link.icon
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={active ? 'active' : ''}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                      <Icon className="nav-icon" />
                      <span>{link.name}</span>
                      {active && (
                        <motion.div
                          className="active-indicator"
                          layoutId="mobileActiveIndicator"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ x: 10 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                      >
                        <FiSettings className="nav-icon" />
                        <span>Admin Dashboard</span>
                      </motion.div>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                      <FiUser className="nav-icon" />
                      <span>Profile</span>
                    </motion.div>
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      navigate('/')
                      setIsMobileMenuOpen(false)
                    }}
                    className="mobile-logout-btn"
                  >
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                      <FiLogOut className="nav-icon" />
                      <span>Logout</span>
                    </motion.div>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <FiLogIn className="nav-icon" />
                    <span>Login</span>
                  </motion.div>
                </Link>
              )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
