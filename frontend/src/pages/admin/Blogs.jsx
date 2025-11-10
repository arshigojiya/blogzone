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
  FiRefreshCw,
  FiX,
  FiImage
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
  const [filePreviews, setFilePreviews] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState(null)

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

  // Helper function to get proper image URL
  // Backend now returns full URLs, so we use them directly
  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg'
    
    // If it's already a full URL string, return as is
    if (typeof image === 'string') {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image
      }
      // If it's a relative path, it should already be handled by backend
      return image
    }
    
    // If it's an object, prefer url field (backend provides full URL)
    if (image?.url) return image.url
    if (image?.path) {
      if (image.path.startsWith('http')) return image.path
      // Fallback: construct URL if needed (shouldn't happen with new backend)
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'
      return `${baseUrl}${image.path}`
    }
    if (image?.filename) {
      // Fallback: construct URL if needed (shouldn't happen with new backend)
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'
      return `${baseUrl}/api/uploads/blogs/${image.filename}`
    }
    return '/placeholder.jpg'
  }

  // Helper function to normalize image URL for comparison
  const normalizeImageUrl = (url) => {
    if (!url) return ''
    // Remove protocol and domain for comparison
    return url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/api\/uploads\/blogs\//, '')
  }

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
    setFilePreviews([])
    setShowAddModal(true)
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    
    // Get proper featured image URL
    let featuredImageUrl = ''
    if (blog.featuredImage) {
      featuredImageUrl = blog.featuredImage
    } else if (blog.images && blog.images.length > 0) {
      // Use first image as featured if no featured image is set
      featuredImageUrl = getImageUrl(blog.images[0])
    }
    
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category: blog.category?._id || blog.category || '',
      tags: blog.tags?.join(', ') || '',
      featuredImage: featuredImageUrl,
      images: blog.images || [],
      status: blog.status || 'draft'
    })
    setSelectedFiles([])
    setFilePreviews([])
    setShowAddModal(true)
  }

  const handleDelete = (blog) => {
    setBlogToDelete(blog)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!blogToDelete) return
    try {
      await apiService.deleteBlog(blogToDelete._id)
      setBlogs(blogs.filter(blog => blog._id !== blogToDelete._id))
      setShowDeleteModal(false)
      setBlogToDelete(null)
    } catch (err) {
      setError('Failed to delete blog')
      console.error('Delete blog error:', err)
      setShowDeleteModal(false)
      setBlogToDelete(null)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    
    // Create previews for selected files
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setFilePreviews(previews)
  }

  const removeFilePreview = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = filePreviews.filter((_, i) => i !== index)
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(filePreviews[index].preview)
    
    setSelectedFiles(newFiles)
    setFilePreviews(newPreviews)
  }

  const removeUploadedImage = (index) => {
    const imageToRemove = formData.images[index]
    const imageUrlToRemove = getImageUrl(imageToRemove)
    const normalizedImageUrl = normalizeImageUrl(imageUrlToRemove)
    const normalizedFeaturedUrl = normalizeImageUrl(formData.featuredImage)
    
    const newImages = formData.images.filter((_, i) => i !== index)
    
    // If removed image was featured image, clear it
    if (normalizedImageUrl === normalizedFeaturedUrl || 
        formData.featuredImage === imageUrlToRemove ||
        (typeof formData.featuredImage === 'string' && 
         typeof imageToRemove === 'object' && 
         (formData.featuredImage.includes(imageToRemove?.filename || '') || 
          formData.featuredImage.includes(imageToRemove?.path || '')))) {
      setFormData({ ...formData, images: newImages, featuredImage: '' })
    } else {
      setFormData({ ...formData, images: newImages })
    }
  }

  const setFeaturedImage = (imageUrl) => {
    setFormData({ ...formData, featuredImage: imageUrl })
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
      // Clean up preview URLs
      filePreviews.forEach(preview => URL.revokeObjectURL(preview.preview))
      setFilePreviews([])
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
                  {blog.featuredImage ? (
                    <img src={blog.featuredImage} alt={blog.title} />
                  ) : blog.images && blog.images.length > 0 ? (
                    <img 
                      src={getImageUrl(blog.images[0])} 
                      alt={blog.title} 
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg'
                      }}
                    />
                  ) : (
                    <div className="blog-image-placeholder">
                      <FiImage size={48} />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="blog-actions">
                    <button onClick={() => handleEdit(blog)}  title="Edit Blog">
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDelete(blog)} title="Delete Blog">
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
        <div className="modal-overlay" onClick={() => {
          // Clean up preview URLs when closing
          filePreviews.forEach(preview => URL.revokeObjectURL(preview.preview))
          setFilePreviews([])
          setShowAddModal(false)
        }}>
          <motion.div
            className="modal-content large"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">{editingBlog ? 'Edit Blog' : 'Add New Blog'}</h2>
            <form onSubmit={handleSubmit} className="blog-form">
              {/* Featured Image Preview at Top */}
              {formData.featuredImage && (
                <div className="form-group featured-image-preview">
                  <label>Featured Image</label>
                  <div className="featured-image-container">
                    <img 
                      src={getImageUrl(formData.featuredImage)} 
                      alt="Featured" 
                      className="featured-preview-img"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImage: '' })}
                      className="remove-featured-btn"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              )}

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
                  onChange={handleFileSelect}
                />
                {uploadingImages && <p className="uploading-text">Uploading images...</p>}
                
                {/* Preview of Selected Files (Before Upload) */}
                {filePreviews.length > 0 && (
                  <div className="image-previews-container">
                    <h4>Selected Images (will be uploaded):</h4>
                    <div className="image-previews-grid">
                      {filePreviews.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={preview.preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeFilePreview(index)}
                            className="remove-image-btn"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview of Uploaded Images */}
                {formData.images && formData.images.length > 0 && (
                  <div className="image-previews-container">
                    <h4>Uploaded Images:</h4>
                    <div className="image-previews-grid">
                      {formData.images.map((image, index) => {
                        const imageUrl = getImageUrl(image)
                        const normalizedImageUrl = normalizeImageUrl(imageUrl)
                        const normalizedFeaturedUrl = normalizeImageUrl(formData.featuredImage)
                        const isFeatured = normalizedImageUrl === normalizedFeaturedUrl || 
                                         formData.featuredImage === imageUrl ||
                                         (typeof formData.featuredImage === 'string' && 
                                          typeof image === 'object' && 
                                          (formData.featuredImage.includes(image.filename) || 
                                           formData.featuredImage.includes(image.path)))
                        return (
                          <div key={index} className={`image-preview-item ${isFeatured ? 'featured' : ''}`}>
                            <img 
                              src={imageUrl} 
                              alt={`Uploaded ${index + 1}`}
                              onError={(e) => {
                                e.target.src = '/placeholder.jpg'
                              }}
                            />
                            {isFeatured && (
                              <div className="featured-badge">Featured</div>
                            )}
                            <div className="image-actions">
                              {!isFeatured && (
                                <button
                                  type="button"
                                  onClick={() => setFeaturedImage(imageUrl)}
                                  className="set-featured-btn"
                                  title="Set as Featured Image"
                                >
                                  <FiImage />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeUploadedImage(index)}
                                className="remove-image-btn"
                              >
                                <FiX />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => {
                  // Clean up preview URLs when canceling
                  filePreviews.forEach(preview => URL.revokeObjectURL(preview.preview))
                  setFilePreviews([])
                  setShowAddModal(false)
                }} className="cancel-btn">
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div className="modal-overlay" onClick={() => {
          setShowDeleteModal(false)
          setBlogToDelete(null)
        }}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Confirm Delete</h2>
            <div className="delete-confirmation-content">
              <p>Are you sure you want to delete the blog <strong>"{blogToDelete.title}"</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
              {blogToDelete.featuredImage && (
                <div className="blog-preview-delete">
                  <img src={blogToDelete.featuredImage} alt={blogToDelete.title} />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false)
                  setBlogToDelete(null)
                }}
              >
                Cancel
              </button>
              <button className="delete-btn-modal" onClick={confirmDelete}>
                <FiTrash2 />
                Delete Blog
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminBlogs

