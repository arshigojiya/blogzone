import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiUsers, 
  FiBookOpen,
  FiSearch,
  FiGrid,
  FiList
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { blogsData } from '../data/blogsData'
import './AdminDashboard.css'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const [blogs, setBlogs] = useState(blogsData)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Technology',
    readTime: '',
    image: '',
    excerpt: '',
    views: 0,
    likes: 0,
    featured: false
  })

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setEditingBlog(null)
    setFormData({
      title: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Technology',
      readTime: '',
      image: '',
      excerpt: '',
      views: 0,
      likes: 0,
      featured: false
    })
    setShowAddModal(true)
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData(blog)
    setShowAddModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      setBlogs(blogs.filter(blog => blog.id !== id))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingBlog) {
      // Update existing blog
      setBlogs(blogs.map(blog => 
        blog.id === editingBlog.id 
          ? { ...blog, ...formData }
          : blog
      ))
    } else {
      // Add new blog
      const newBlog = {
        id: blogs.length + 1,
        ...formData
      }
      setBlogs([...blogs, newBlog])
    }
    setShowAddModal(false)
    setEditingBlog(null)
  }

  const stats = [
    { label: 'Total Blogs', value: blogs.length, icon: FiBookOpen, color: '#10b981' },
    { label: 'Total Views', value: blogs.reduce((sum, b) => sum + b.views, 0).toLocaleString(), icon: FiUsers, color: '#3b82f6' },
    { label: 'Total Likes', value: blogs.reduce((sum, b) => sum + b.likes, 0).toLocaleString(), icon: FiUsers, color: '#f59e0b' },
    { label: 'Featured', value: blogs.filter(b => b.featured).length, icon: FiUsers, color: '#ef4444' }
  ]

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name}</p>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>

        {/* Stats */}
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
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="dashboard-actions">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="action-buttons">
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
            <button className="add-btn" onClick={handleAdd}>
              <FiPlus />
              Add New Blog
            </button>
          </div>
        </div>

        {/* Blogs List */}
        <div className={`blogs-grid ${viewMode}`}>
          {filteredBlogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              className="blog-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="blog-image">
                <img src={blog.image} alt={blog.title} />
                <div className="blog-actions">
                  <button onClick={() => handleEdit(blog)} className="edit-btn">
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(blog.id)} className="delete-btn">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="category">{blog.category}</span>
                  {blog.featured && <span className="featured">Featured</span>}
                </div>
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <div className="blog-info">
                  <span>By {blog.author}</span>
                  <span>{blog.views.toLocaleString()} views</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="modal-title">{editingBlog ? 'Edit Blog' : 'Add New Blog'}</h2>
              <form onSubmit={handleSubmit} className="blog-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option>Technology</option>
                      <option>Design</option>
                      <option>Backend</option>
                      <option>Frontend</option>
                      <option>DevOps</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Read Time</label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="e.g., 5 min read"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Views</label>
                    <input
                      type="number"
                      value={formData.views}
                      onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Likes</label>
                    <input
                      type="number"
                      value={formData.likes}
                      onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Featured
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingBlog ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

