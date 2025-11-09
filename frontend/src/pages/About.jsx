import { motion } from 'framer-motion'
import { FiCode, FiBook, FiHeart, FiTarget, FiUsers, FiAward } from 'react-icons/fi'
import './About.css'

function About() {
  const values = [
    {
      icon: FiCode,
      title: 'Quality Content',
      description: 'We focus on delivering high-quality, well-researched articles that provide real value to our readers.'
    },
    {
      icon: FiBook,
      title: 'Continuous Learning',
      description: 'We believe in the power of continuous learning and sharing knowledge with the community.'
    },
    {
      icon: FiHeart,
      title: 'Community First',
      description: 'Our community is at the heart of everything we do. We listen, learn, and grow together.'
    },
    {
      icon: FiTarget,
      title: 'Practical Solutions',
      description: 'We provide practical, actionable solutions that you can implement in your projects immediately.'
    }
  ]

  const stats = [
    { icon: FiUsers, label: 'Active Readers', value: '10K+' },
    { icon: FiBook, label: 'Blog Posts', value: '100+' },
    { icon: FiAward, label: 'Categories', value: '8' }
  ]

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
    <div className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <motion.div
          className="about-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-badge">
            <span className="badge-icon">👋</span>
            <span>About BlogZone</span>
          </div>
          <h1 className="hero-title">Welcome to BlogZone</h1>
          <p className="hero-subtitle">
            Your trusted source for the latest insights, tutorials, and trends in technology and web development
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.section
          className="mission-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <p>
              At BlogZone, we're passionate about making technology accessible to everyone. 
              Our mission is to provide high-quality, practical content that helps developers 
              of all levels learn, grow, and succeed in their careers.
            </p>
            <p>
              We believe that knowledge should be shared freely, and that's why we're committed 
              to creating comprehensive guides, tutorials, and insights that are both educational 
              and actionable. Whether you're just starting your journey or looking to stay updated 
              with the latest trends, BlogZone is here to support you.
            </p>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="stats-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                className="stat-card"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Icon className="stat-icon" />
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            )
          })}
        </motion.section>

        {/* Values Section */}
        <motion.section
          className="values-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  className="value-card"
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                >
                  <div className="value-icon-wrapper">
                    <Icon className="value-icon" />
                  </div>
                  <h3 className="value-title">{value.title}</h3>
                  <p className="value-description">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="cta-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="cta-title">Join Our Community</h2>
          <p className="cta-text">
            Stay updated with our latest posts and join thousands of developers 
            who are learning and growing together.
          </p>
          <div className="cta-buttons">
            <button className="cta-btn primary">Explore Blogs</button>
            <button className="cta-btn secondary">Get in Touch</button>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default About

