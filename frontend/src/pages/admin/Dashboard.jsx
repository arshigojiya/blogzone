import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiBookOpen, FiUsers, FiEye, FiHeart, FiTrendingUp, FiGrid, FiRefreshCw } from 'react-icons/fi'
import { apiService } from '../../services/api'
import './AdminPages.css'

function AdminDashboard() {
  const [stats, setStats] = useState([])
  const [recentBlogs, setRecentBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load blogs and user stats
      const [blogsResponse, userStatsResponse] = await Promise.all([
        apiService.getBlogs({ limit: 5 }),
        apiService.getUserStats()
      ])

      const blogs = blogsResponse.blogs || []
      const userStats = userStatsResponse

      // Calculate stats
      const totalBlogs = blogsResponse.total || 0
      const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
      const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0)
      const publishedBlogs = blogs.filter(blog => blog.status === 'published').length

      const dashboardStats = [
        {
          label: 'Total Blogs',
          value: totalBlogs,
          icon: FiBookOpen,
          color: '#10b981',
          change: '+12%'
        },
        {
          label: 'Total Views',
          value: totalViews.toLocaleString(),
          icon: FiEye,
          color: '#3b82f6',
          change: '+8%'
        },
        {
          label: 'Total Likes',
          value: totalLikes.toLocaleString(),
          icon: FiHeart,
          color: '#f59e0b',
          change: '+15%'
        },
        {
          label: 'Published Posts',
          value: publishedBlogs,
          icon: FiTrendingUp,
          color: '#ef4444',
          change: `${Math.round((publishedBlogs / totalBlogs) * 100) || 0}%`
        },
        {
          label: 'Total Users',
          value: userStats.totalUsers || 0,
          icon: FiUsers,
          color: '#06b6d4',
          change: `+${userStats.recentUsers?.length || 0}`
        },
        {
          label: 'Admin Users',
          value: userStats.adminUsers || 0,
          icon: FiGrid,
          color: '#8b5cf6',
          change: `${userStats.adminUsers || 0}/${userStats.totalUsers || 0}`
        }
      ]

      setStats(dashboardStats)
      setRecentBlogs(blogs)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <FiRefreshCw className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-btn">
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your blog.</p>
        <button onClick={loadDashboardData} className="refresh-btn" disabled={loading}>
          <FiRefreshCw className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="stat-icon-wrapper" style={{ background: `${stat.color}20`, color: stat.color }}>
                <Icon />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-change" style={{ color: stat.color }}>
                  <FiTrendingUp />
                  {stat.change}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Blogs */}
      <div className="content-section">
        <h2 className="section-title">Recent Blogs</h2>
        <div className="blogs-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBlogs.map((blog, index) => (
                <motion.tr
                  key={blog._id || blog.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>
                    <div className="blog-title-cell">
                      <img src={blog.featuredImage || blog.image || '/placeholder.jpg'} alt={blog.title} />
                      <span>{blog.title}</span>
                    </div>
                  </td>
                  <td>{blog.author?.username || blog.author}</td>
                  <td>
                    <span className="category-badge">{blog.category?.name || blog.category}</span>
                  </td>
                  <td>{(blog.views || 0).toLocaleString()}</td>
                  <td>{(blog.likes?.length || blog.likes || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${blog.status}`}>
                      {blog.status === 'published' ? 'Published' :
                       blog.status === 'draft' ? 'Draft' :
                       blog.status === 'archived' ? 'Archived' : 'Unknown'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

