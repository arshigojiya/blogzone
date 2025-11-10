import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiLogOut, FiCalendar, FiImage, FiFileText } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import './Profile.css'

function Profile() {
  const { user: authUser, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [userBlogs, setUserBlogs] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    avatar: null
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  // Fetch user profile and blogs
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch profile
        const profileData = await apiService.getProfile()
        setUser(profileData)
        
        // Set form data
        setFormData({
          firstName: profileData.profile?.firstName || '',
          lastName: profileData.profile?.lastName || '',
          bio: profileData.profile?.bio || '',
          avatar: profileData.profile?.avatar || null
        })
        
        // Set avatar preview
        if (profileData.profile?.avatar?.url) {
          setAvatarPreview(profileData.profile.avatar.url)
        }
        
        // Fetch user blogs
        if (profileData._id) {
          try {
            const blogs = await apiService.getUserBlogs(profileData._id)
            setUserBlogs(Array.isArray(blogs) ? blogs : [])
          } catch (err) {
            console.error('Failed to fetch user blogs:', err)
            setUserBlogs([])
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [authUser])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }

      setAvatarFile(file)
      setError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      let avatarData = formData.avatar

      // Upload avatar if new file selected
      if (avatarFile) {
        try {
          const uploadResult = await apiService.uploadAvatar(avatarFile)
          if (uploadResult.file) {
            avatarData = {
              filename: uploadResult.file.filename,
              path: uploadResult.file.path,
              originalName: uploadResult.file.originalName,
              url: uploadResult.file.url
            }
          }
        } catch (uploadErr) {
          console.error('Avatar upload failed:', uploadErr)
          setError('Failed to upload avatar. Please try again.')
          setSaving(false)
          return
        }
      }

      // Update profile
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        ...(avatarData && { avatar: avatarData })
      }

      const updatedUser = await apiService.updateProfile(updateData)
      setUser(updatedUser)
      
      // Update auth context and localStorage
      if (authUser) {
        const updatedAuthUser = {
          ...authUser,
          ...updatedUser,
          profile: updatedUser.profile
        }
        localStorage.setItem('blogzone_user', JSON.stringify(updatedAuthUser))
        // Refresh context state
        refreshUser()
      }

      setIsEditing(false)
      setAvatarFile(null)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      bio: user?.profile?.bio || '',
      avatar: user?.profile?.avatar || null
    })
    setAvatarPreview(user?.profile?.avatar?.url || null)
    setAvatarFile(null)
    setError(null)
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getFullName = () => {
    if (user?.profile?.firstName || user?.profile?.lastName) {
      return `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
    }
    return user?.username || 'User'
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (user?.profile?.avatar?.url) return user.profile.avatar.url
    return '/placeholder.jpg'
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-state">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user && !authUser) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error-message">
            <p>Please login to view your profile</p>
            <button onClick={() => navigate('/login')} className="retry-btn">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
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

        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{error}</p>
            <button onClick={() => setError(null)} className="error-close">×</button>
          </motion.div>
        )}

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
                  src={getAvatarUrl()}
                  alt={getFullName()}
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg'
                  }}
                />
                {isEditing && (
                  <div className="avatar-overlay" onClick={handleAvatarClick}>
                    <div className="avatar-edit-btn">
                      <FiImage />
                      <span>Change Photo</span>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
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
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Your first name"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiUser className="label-icon" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Your last name"
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
                      value={user.email}
                      disabled
                      className="disabled-input"
                      placeholder="Email cannot be changed"
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

                  <div className="form-actions">
                    <button
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <FiX />
                      Cancel
                    </button>
                    <button
                      className="save-btn"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <FiSave />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-details">
                  <h2 className="profile-name">{getFullName()}</h2>
                  <p className="profile-username">@{user.username}</p>
                  <p className="profile-email">
                    <FiMail className="detail-icon" />
                    {user.email}
                  </p>
                  <p className="profile-bio">
                    {user.profile?.bio || 'No bio yet. Add one to tell others about yourself!'}
                  </p>
                  <div className="profile-meta">
                    <div className="meta-item">
                      <FiCalendar className="meta-icon" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="meta-item">
                      <FiUser className="meta-icon" />
                      <span>Role: {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}</span>
                    </div>
                    <div className="meta-item">
                      <FiFileText className="meta-icon" />
                      <span>{userBlogs.length} {userBlogs.length === 1 ? 'Blog' : 'Blogs'}</span>
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
