import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiGrid, FiList, FiRefreshCw, FiClock, FiEye, FiHeart } from 'react-icons/fi'
import { apiService } from '../services/api'
import './Blogs.css'

function Blogs() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
    } else {
      setSelectedCategory('')
    }
  }, [searchParams])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [blogsResponse, categoriesData] = await Promise.all([
        apiService.getBlogs({ limit: 100, status: 'published' }),
        apiService.getCategories()
      ])
      
      // Backend returns { blogs, total, ... } structure
      const blogsArray = blogsResponse?.blogs || blogsResponse || []
      setBlogs(Array.isArray(blogsArray) ? blogsArray : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (err) {
      setError('Failed to load blogs. Please try again.')
      console.error('Load blogs error:', err)
      setBlogs([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get blog image URL
  const getBlogImageUrl = (blog) => {
    if (blog.featuredImage) {
      return blog.featuredImage
    }
    if (blog.images && blog.images.length > 0) {
      const firstImage = blog.images[0]
      if (firstImage?.url) {
        return firstImage.url
      }
      if (firstImage?.path && firstImage.path.startsWith('http')) {
        return firstImage.path
      }
    }
    return '/placeholder.jpg'
  }

  // Calculate read time (approximate: 200 words per minute)
  const calculateReadTime = (content) => {
    if (!content) return '5 min read'
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchQuery === '' ||
                         blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
                           blog.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
                           blog.category?.slug?.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory && blog.status === 'published'
  })

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug)
    if (categorySlug) {
      setSearchParams({ category: categorySlug })
    } else {
      setSearchParams({})
    }
  }

  const handleReadMore = (blog) => {
    if (blog.slug) {
      navigate(`/blog/${blog.slug}`)
    }
  }

  if (loading) {
    return (
      <div className="blogs-page">
        <div className="blogs-container">
          <div className="loading-spinner">
            <FiRefreshCw className="spinner" />
            <p>Loading blogs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blogs-page">
        <div className="blogs-container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadData} className="retry-btn">
              <FiRefreshCw /> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blogs-page">
      <div className="blogs-container">
        {/* Page Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-title">All Blog Posts</h1>
          <p className="page-subtitle">
            Explore our complete collection of articles and tutorials
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="blogs-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="category-filter">
              <FiFilter className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="category-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id || category.id} value={category.slug || category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="results-count">
          <span>{filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'} found</span>
        </div>

        {/* Blog List */}
        {filteredBlogs.length > 0 ? (
          <div className={`blogs-list ${viewMode}`}>
            {filteredBlogs.map((blog, index) => (
              <motion.article
                key={blog._id || blog.id}
                className="blog-item"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="blog-image">
                  <img 
                    src={getBlogImageUrl(blog)} 
                    alt={blog.title}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg'
                    }}
                  />
                  <div className="blog-category">{blog.category?.name || 'Uncategorized'}</div>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-author">{blog.author?.username || blog.author || 'Unknown'}</span>
                    <span className="blog-date">
                      {blog.createdAt 
                        ? new Date(blog.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })
                        : 'N/A'
                      }
                    </span>
                    <span className="blog-read-time">
                      <FiClock className="meta-icon" />
                      {calculateReadTime(blog.content)}
                    </span>
                  </div>
                  <h2 className="blog-title">{blog.title}</h2>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  <div className="blog-stats">
                    <span>
                      <FiEye className="stat-icon" />
                      {(blog.views || 0).toLocaleString()} views
                    </span>
                    <span>
                      <FiHeart className="stat-icon" />
                      {(blog.likes?.length || blog.likes || 0).toLocaleString()} likes
                    </span>
                  </div>
                  <button 
                    className="read-more-btn"
                    onClick={() => handleReadMore(blog)}
                  >
                    Read More
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No blogs found matching your search criteria.</p>
            {searchQuery || selectedCategory ? (
              <button 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setSearchParams({})
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Blogs

