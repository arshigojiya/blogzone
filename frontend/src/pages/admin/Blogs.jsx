import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiGrid,
  FiList,
  FiUpload,
  FiRefreshCw
} from 'react-icons/fi'
import { apiService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import './AdminPages.css'

function AdminBlogs() {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: '',
    images: [],
    status: 'draft'
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    loadBlogs()
    loadCategories()
  }, [])

  const loadBlogs = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBlogs({ limit: 100 }) // Get all blogs for admin
      setBlogs(response.blogs || [])
    } catch (err) {
      setError('Failed to load blogs')
      console.error('Load blogs error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories()
      setCategories(response || [])
    } catch (err) {
      console.error('Load categories error:', err)
    }
  }

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setEditingBlog(null)
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: categories.length > 0 ? categories[0]._id : '',
      tags: '',
      featuredImage: '',
      images: [],
      status: 'draft'
    })
    setSelectedFiles([])
    setShowAddModal(true)
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category: blog.category?._id || blog.category || '',
      tags: blog.tags?.join(', ') || '',
      featuredImage: blog.featuredImage || '',
      images: blog.images || [],
      status: blog.status || 'draft'
    })
    setSelectedFiles([])
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await apiService.deleteBlog(id)
        setBlogs(blogs.filter(blog => blog._id !== id))
      } catch (err) {
        setError('Failed to delete blog')
        console.error('Delete blog error:', err)
      }
    }
  }

  const handleImageUpload = async (files) => {
    if (files.length === 0) return []

    try {
      setUploadingImages(true)
      const response = await apiService.uploadBlogImages(files)
      return response.files || []
    } catch (err) {
      console.error('Image upload error:', err)
      return []
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let uploadedImages = []
      if (selectedFiles.length > 0) {
        uploadedImages = await handleImageUpload(selectedFiles)
      }

      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: [...(formData.images || []), ...uploadedImages]
      }

      if (editingBlog) {
        const response = await apiService.updateBlog(editingBlog._id, blogData)
        setBlogs(blogs.map(blog =>
          blog._id === editingBlog._id ? response : blog
        ))
      } else {
        const response = await apiService.createBlog(blogData)
        setBlogs([response, ...blogs])
      }

      setShowAddModal(false)
      setEditingBlog(null)
      setSelectedFiles([])
    } catch (err) {
      setError('Failed to save blog')
      console.error('Save blog error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blog Management</h1>
          <p className="page-subtitle">Create, edit, and manage all blog posts</p>
        </div>
        <div className="header-actions">
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

      {/* Search */}
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading/Error States */}
      {loading ? (
        <div className="loading-spinner">
          <FiRefreshCw className="spinner" />
          <p>Loading blogs...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadBlogs} className="retry-btn">
            <FiRefreshCw /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* Blogs List */}
          <div className={`blogs-grid ${viewMode}`}>
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                className="blog-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="blog-image">
                  <img src={blog.featuredImage || '/placeholder.jpg'} alt={blog.title} />
                  <div className="blog-actions">
                    <button onClick={() => handleEdit(blog)} className="edit-btn">
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDelete(blog._id)} className="delete-btn">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="category">{blog.category?.name || 'Uncategorized'}</span>
                    <span className={`status-badge ${blog.status}`}>
                      {blog.status === 'published' ? 'Published' :
                       blog.status === 'draft' ? 'Draft' :
                       blog.status === 'archived' ? 'Archived' : 'Unknown'}
                    </span>
                  </div>
                  <h3 className="blog-title">{blog.title}</h3>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  <div className="blog-info">
                    <span>By {blog.author?.username || 'Unknown'}</span>
                    <span>{(blog.views || 0).toLocaleString()} views</span>
                    <span>{(blog.likes?.length || 0).toLocaleString()} likes</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="empty-state">
              <p>No blogs found matching your search.</p>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <motion.div
            className="modal-content large"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">{editingBlog ? 'Edit Blog' : 'Add New Blog'}</h2>
            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="8"
                  placeholder="Write your blog content here..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Excerpt *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows="3"
                  placeholder="Brief summary of the blog"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="javascript, react, tutorial"
                />
              </div>

              <div className="form-group">
                <label>Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                />
                {uploadingImages && <p className="uploading-text">Uploading images...</p>}
                {selectedFiles.length > 0 && (
                  <p className="file-count">{selectedFiles.length} file(s) selected</p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting || uploadingImages}>
                  {submitting ? 'Saving...' : (editingBlog ? 'Update Blog' : 'Create Blog')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminBlogs

