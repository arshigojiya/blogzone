import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi'
import { blogsData } from '../data/blogsData'
import { categoriesData } from '../data/categoriesData'
import './Blogs.css'

function Blogs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  const filteredBlogs = blogsData.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
                           blog.category.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

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
                value={selectedCategory || ''}
                onChange={(e) => {
                  const category = e.target.value || null
                  setSelectedCategory(category)
                  if (category) {
                    setSearchParams({ category })
                  } else {
                    setSearchParams({})
                  }
                }}
                className="category-select"
              >
                <option value="">All Categories</option>
                {categoriesData.map(category => (
                  <option key={category.id} value={category.name}>
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
                key={blog.id}
                className="blog-item"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="blog-image">
                  <img src={blog.image} alt={blog.title} />
                  <div className="blog-category">{blog.category}</div>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-author">{blog.author}</span>
                    <span className="blog-date">
                      {new Date(blog.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="blog-read-time">{blog.readTime}</span>
                  </div>
                  <h2 className="blog-title">{blog.title}</h2>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  <div className="blog-stats">
                    <span>{blog.views.toLocaleString()} views</span>
                    <span>{blog.likes.toLocaleString()} likes</span>
                  </div>
                  <button className="read-more-btn">Read More</button>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No blogs found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Blogs

