import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CategoryCard from '../components/CategoryCard'
import { apiService } from '../services/api'
import './Categories.css'

function Categories() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, blogsData] = await Promise.all([
        apiService.getCategories(),
        apiService.getBlogs()
      ])
      console.log('Categories data:', categoriesData)
      console.log('Blogs data:', blogsData)
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setBlogs(Array.isArray(blogsData) ? blogsData : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      setCategories([])
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.slug)
    navigate(`/blogs?category=${category.name}`)
  }

  const getCategoryBlogs = (categoryName) => {
    return blogs.filter(blog =>
      blog.category?.name?.toLowerCase() === categoryName.toLowerCase()
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="categories-page">
      <div className="categories-container">
        {/* Page Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-badge">
            <span className="badge-icon">🔖</span>
            <span>Explore Categories</span>
          </div>
          <h1 className="page-title">Browse by Topics</h1>
          <p className="page-subtitle">
            Discover content organized by categories and find exactly what you're looking for
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="categories-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="no-data">No categories found</div>
          ) : (
            categories.map((category) => {
              console.log('Rendering category:', category)
              const categoryBlogs = getCategoryBlogs(category.name)
              const categoryWithCount = {
                ...category,
                count: categoryBlogs.length
              }

              return (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                >
                  <CategoryCard
                    category={categoryWithCount}
                    isActive={selectedCategory === category.slug}
                    onClick={() => handleCategoryClick(category)}
                  />
                  <div className="category-preview">
                    <h3 className="preview-title">Recent Posts</h3>
                    <div className="preview-blogs">
                      {categoryBlogs.slice(0, 3).map((blog) => (
                        <div key={blog._id} className="preview-item">
                          <img src={blog.featuredImage} alt={blog.title} />
                          <div className="preview-content">
                            <h4>{blog.title}</h4>
                            <span>{blog.readTime || '5 min read'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {categoryBlogs.length > 3 && (
                      <button
                        className="view-all-btn"
                        onClick={() => navigate(`/blogs?category=${category.name}`)}
                      >
                        View All {categoryBlogs.length} Posts
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Categories

