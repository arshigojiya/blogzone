import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiCalendar, FiTrash2, FiSearch, FiPlus } from 'react-icons/fi'
import { apiService } from '../../services/api'
import './AdminPages.css'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [editAvatarFile, setEditAvatarFile] = useState(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiService.getUsers()
      setUsers(response.users || [])
    } catch (err) {
      setError('Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.profile?.firstName && user.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.profile?.lastName && user.profile.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAdd = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)

      let avatarData = null
      if (avatarFile) {
        const uploadResult = await apiService.uploadAvatar(avatarFile)
        if (uploadResult.file) {
          avatarData = {
            filename: uploadResult.file.filename,
            path: uploadResult.file.path,
            originalName: uploadResult.file.originalName
          }
        }
      }

      const userData = { ...formData }
      if (avatarData) {
        userData.avatar = avatarData
      }

      await apiService.createUser(userData)
      setShowAddModal(false)
      setFormData({ username: '', email: '', password: '', firstName: '', lastName: '' })
      setAvatarFile(null)
      setAvatarPreview('')
      fetchUsers() // Refresh the list
    } catch (err) {
      alert('Failed to create user: ' + (err.message || 'Unknown error'))
      console.error('Error creating user:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setEditFormData({
      username: user.username || '',
      email: user.email || '',
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || ''
    })
    setEditAvatarPreview(user.profile?.avatar?.path || '')
    setEditAvatarFile(null)
    setShowEditModal(true)
  }

  const handleAvatarChange = (e, isEdit = false) => {
    const file = e.target.files[0]
    if (file) {
      if (isEdit) {
        setEditAvatarFile(file)
        setEditAvatarPreview(URL.createObjectURL(file))
      } else {
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
      }
    }
  }

  const handleUpdate = async () => {
    if (!editFormData.username || !editFormData.email) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)

      let avatarData = null
      if (editAvatarFile) {
        const uploadResult = await apiService.uploadAvatar(editAvatarFile)
        if (uploadResult.file) {
          avatarData = {
            filename: uploadResult.file.filename,
            path: uploadResult.file.path,
            originalName: uploadResult.file.originalName
          }
        }
      }

      const userData = { ...editFormData }
      if (avatarData) {
        userData.avatar = avatarData
      }

      await apiService.updateUser(editingUser._id || editingUser.id, userData)
      setShowEditModal(false)
      setEditingUser(null)
      setEditAvatarFile(null)
      setEditAvatarPreview('')
      fetchUsers() // Refresh the list
    } catch (err) {
      alert('Failed to update user: ' + (err.message || 'Unknown error'))
      console.error('Error updating user:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    try {
      await apiService.deleteUser(userToDelete._id || userToDelete.id)
      setShowDeleteModal(false)
      setUserToDelete(null)
      fetchUsers() // Refresh the list
    } catch (err) {
      alert('Failed to delete user: ' + (err.message || 'Unknown error'))
      console.error('Error deleting user:', err)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all users and their permissions</p>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <FiPlus />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="content-section">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id || user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <div className="user-cell">
                        <img
                          src={user.profile?.avatar?.path || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces'}
                          alt={user.username}
                        />
                        <span>{user.profile?.firstName && user.profile?.lastName
                          ? `${user.profile.firstName} ${user.profile.lastName}`
                          : user.username}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                          style={{ marginRight: '8px' }}
                        >
                          <FiUser style={{ color: 'blue' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          title="Delete User"
                        >
                          <FiTrash2 style={{
                            color: 'red'
                          }}/>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Add New User</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
              <div className="form-group">
                <label>Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarChange(e, false)}
                />
                {avatarPreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowAddModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleAdd} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Add User'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Edit User</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
              <div className="form-group">
                <label>Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarChange(e, true)}
                />
                {editAvatarPreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={editAvatarPreview}
                      alt="Avatar preview"
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowEditModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleUpdate} disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Confirm Delete</h2>
            <p>Are you sure you want to delete the user "{userToDelete.username}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers

