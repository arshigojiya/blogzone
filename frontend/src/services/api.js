// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  getAuthHeaders() {
    const token = localStorage.getItem('blogzone_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Blog APIs
  async getBlogs(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/blogs?${queryString}`)
  }

  async getBlog(slug) {
    return this.request(`/blogs/${slug}`)
  }

  async createBlog(blogData) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    })
  }

  async updateBlog(id, blogData) {
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    })
  }

  async deleteBlog(id) {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    })
  }

  async likeBlog(id) {
    return this.request(`/blogs/${id}/like`, {
      method: 'POST',
    })
  }

  async addComment(blogId, content) {
    return this.request(`/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async getUserBlogs(userId) {
    return this.request(`/blogs/user/${userId}`)
  }

  // Category APIs
  async getCategories() {
    return this.request('/categories')
  }

  async getCategory(slug) {
    return this.request(`/categories/${slug}`)
  }

  async getBlogsByCategory(slug, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/categories/${slug}/blogs?${queryString}`)
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  }

  async updateCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // User Management APIs (Admin)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/users?${queryString}`)
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getUser(id) {
    return this.request(`/users/${id}`)
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async updateUserRole(id, role) {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  async getUserStats() {
    return this.request('/users/stats/overview')
  }

  // Upload APIs
  async uploadBlogImage(file) {
    const formData = new FormData()
    formData.append('featuredImage', file)

    const token = localStorage.getItem('blogzone_token')
    return fetch(`${this.baseURL}/uploads/blog-featured`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json())
  }

  async uploadBlogImages(files) {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    const token = localStorage.getItem('blogzone_token')
    return fetch(`${this.baseURL}/uploads/blog-images`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json())
  }

  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)

    const token = localStorage.getItem('blogzone_token')
    return fetch(`${this.baseURL}/uploads/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json())
  }

  async uploadCategoryImage(file) {
    const formData = new FormData()
    formData.append('categoryImage', file)

    const token = localStorage.getItem('blogzone_token')
    return fetch(`${this.baseURL}/uploads/category-image`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json())
  }

  async deleteUploadedFile(type, filename) {
    return this.request(`/uploads/${type}/${filename}`, {
      method: 'DELETE',
    })
  }

  // Profile APIs
  async getProfile() {
    return this.request('/auth/profile')
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }
}

export const apiService = new ApiService()
export default apiService