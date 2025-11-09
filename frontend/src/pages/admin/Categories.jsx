import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUpload } from 'react-icons/fi'
import { apiService } from '../../services/api'
import './AdminPages.css'

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '💻',
    image: '',
    color: '#10b981'
  })
  const [uploading, setUploading] = useState(false)

  // Load categories on component mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '💻',
      image: '',
      color: '#10b981'
    })
    setShowAddModal(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData(category)
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.deleteCategory(id)
        setCategories(categories.filter(cat => cat._id !== id))
      } catch (error) {
        console.error('Failed to delete category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        const updatedCategory = await apiService.updateCategory(editingCategory._id, formData)
        setCategories(categories.map(cat =>
          cat._id === editingCategory._id ? updatedCategory : cat
        ))
      } else {
        const newCategory = await apiService.createCategory(formData)
        setCategories([...categories, newCategory])
      }
      setShowAddModal(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const result = await apiService.uploadCategoryImage(file)
      setFormData({ ...formData, image: result.file.url })
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Organize your content with categories</p>
        </div>
        <button className="add-btn" onClick={handleAdd}>
          <FiPlus />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="no-data">No categories found</div>
        ) : (
          filteredCategories.map((category, index) => (
            <motion.div
              key={category._id}
              className="category-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div
                className="category-image"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className="category-overlay" style={{ background: `${category.color}80` }} />
                <div className="category-icon">{category.icon}</div>
                <div className="category-actions">
                  <button onClick={() => handleEdit(category)} >
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(category._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <div className="category-content">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-meta">
                  <span>{category.blogsCount || 0} Posts</span>
                  <span className="category-slug">{category.slug}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
            <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-slug"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Icon (Emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="💻"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Image</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="upload-btn">
                    <FiUpload />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                  {formData.image && (
                    <div className="image-preview">
                      <img src={formData.image} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="remove-image-btn"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories

