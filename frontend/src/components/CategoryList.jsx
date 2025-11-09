import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import CategoryCard from './CategoryCard'
import { apiService } from '../services/api'
import './CategoryList.css'

function CategoryList({ onCategorySelect, selectedCategory }) {
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef(null)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [])

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft
      scrollContainerRef.current.scrollTo({
        left: currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      })
    }
  }

  const handleCategoryClick = (category) => {
    onCategorySelect(category.slug === selectedCategory ? null : category.slug)
  }

  return (
    <section className="category-section">
      <div className="category-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-badge">
            <span className="badge-icon">🔖</span>
            <span>Explore by Categories</span>
          </div>
          <h2 className="section-title">Browse Topics</h2>
          <p className="section-subtitle">
            Discover content organized by categories and find exactly what you're looking for
          </p>
        </motion.div>

        <div className="category-scroll-wrapper">
          {showLeftArrow && (
            <motion.button
              className="scroll-button left"
              onClick={() => scroll('left')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll left"
            >
              <FiChevronLeft />
            </motion.button>
          )}

          <div
            className="category-scroll-container"
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
          >
            <div className="category-list">
              {loading ? (
                <div className="loading">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="no-data">No categories found</div>
              ) : (
                categories.map((category, index) => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    isActive={selectedCategory === category.slug}
                    onClick={() => handleCategoryClick(category)}
                  />
                ))
              )}
            </div>
          </div>

          {showRightArrow && (
            <motion.button
              className="scroll-button right"
              onClick={() => scroll('right')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll right"
            >
              <FiChevronRight />
            </motion.button>
          )}
        </div>

        {selectedCategory && (
          <motion.div
            className="filter-indicator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <span>
              Showing posts in: <strong>{categories.find(c => c.slug === selectedCategory)?.name}</strong>
            </span>
            <button
              onClick={() => onCategorySelect(null)}
              className="clear-filter-btn"
            >
              Clear Filter
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default CategoryList

