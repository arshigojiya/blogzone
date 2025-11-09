import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Blogs from './pages/Blogs'
import Categories from './pages/Categories'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminBlogs from './pages/admin/Blogs'
import AdminCategories from './pages/admin/Categories'
import './App.css'

function App() {
  const [isDark, setIsDark] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug)
    // Scroll to recommended blogs section when category is selected
    if (categorySlug) {
      setTimeout(() => {
        const element = document.querySelector('.recommended-blogs')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/*" 
            element={
              <div className={`app ${isDark ? 'dark' : 'light'}`}>
                <Navbar
                  isDark={isDark}
                  toggleTheme={toggleTheme}
                />
                <main>
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <Home 
                          selectedCategory={selectedCategory}
                          onCategorySelect={handleCategorySelect}
                        />
                      } 
                    />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="" element={<AdminDashboard />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
