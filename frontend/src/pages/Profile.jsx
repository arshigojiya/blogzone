import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiLogOut, FiCalendar } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Profile.css'

function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings and preferences</p>
        </motion.div>

        <div className="profile-content">
          {/* Profile Card */}
          <motion.div
            className="profile-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <img
                  src={formData.avatar || user.avatar}
                  alt={user.name}
                  className="profile-avatar"
                />
                {isEditing && (
                  <div className="avatar-overlay">
                    <label className="avatar-edit-btn">
                      <FiEdit2 />
                      <input
                        type="url"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleChange}
                        placeholder="Image URL"
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>
              {!isEditing && (
                <button
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>
                      <FiUser className="label-icon" />
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiMail className="label-icon" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiUser className="label-icon" />
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiUser className="label-icon" />
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="cancel-btn"
                      onClick={handleCancel}
                    >
                      <FiX />
                      Cancel
                    </button>
                    <button
                      className="save-btn"
                      onClick={handleSave}
                    >
                      <FiSave />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-details">
                  <h2 className="profile-name">{user.name}</h2>
                  <p className="profile-email">
                    <FiMail className="detail-icon" />
                    {user.email}
                  </p>
                  <p className="profile-bio">{user.bio || 'No bio yet. Add one to tell others about yourself!'}</p>
                  <div className="profile-meta">
                    <div className="meta-item">
                      <FiCalendar className="meta-icon" />
                      <span>Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="meta-item">
                      <FiUser className="meta-icon" />
                      <span>Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            className="account-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="actions-title">Account Actions</h3>
            <div className="actions-list">
              <button className="action-btn logout-btn" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile

