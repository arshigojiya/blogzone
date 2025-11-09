import Hero from '../components/Hero'
import CategoryList from '../components/CategoryList'
import RecommendedBlogs from '../components/RecommendedBlogs'
import AuthorIntro from '../components/AuthorIntro'

function Home({ selectedCategory, onCategorySelect }) {
  return (
    <>
      <Hero />
      <CategoryList
        onCategorySelect={onCategorySelect}
        selectedCategory={selectedCategory}
      />
      <RecommendedBlogs selectedCategory={selectedCategory} />
      <AuthorIntro />
    </>
  )
}

export default Home

