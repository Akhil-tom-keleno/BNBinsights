import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Search, Tag } from 'lucide-react';
import type { BlogPost } from '@/types';
import { useBlog } from '@/hooks/useApi';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { getPosts, getCategories, isLoading } = useBlog();

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [selectedCategory]);

  const loadPosts = async () => {
    const data = await getPosts({ 
      category: selectedCategory || undefined,
      limit: 12 
    });
    if (data) setPosts(data as BlogPost[]);
  };

  const loadCategories = async () => {
    const data = await getCategories();
    if (data) setCategories(data as string[]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Hero */}
      <div className="bg-[#0B0F17] pt-24 pb-16">
        <div className="w-full px-6 lg:px-[6vw]">
          <nav className="flex items-center gap-2 text-sm text-[#A7B1C2] mb-6">
            <Link to="/" className="hover:text-[#D4A23F]">Home</Link>
            <ArrowRight size={14} />
            <span className="text-white">Blog</span>
          </nav>
          
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            BNBinsights Blog
          </h1>
          <p className="text-[#A7B1C2] max-w-2xl text-lg">
            Expert insights, guides, and tips for Dubai short-term rental property owners and managers.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-b border-[#0B0F17]/8">
        <div className="w-full px-6 lg:px-[6vw] py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
              />
            </form>
            
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-[#D4A23F] text-white' 
                    : 'bg-[#F6F7F9] text-[#6B7280] hover:bg-[#0B0F17]/5'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-[#D4A23F] text-white' 
                      : 'bg-[#F6F7F9] text-[#6B7280] hover:bg-[#0B0F17]/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A23F]"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6B7280] text-lg">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className={`bg-white rounded-2xl overflow-hidden card-shadow hover:shadow-lg transition-shadow ${
                  index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Image */}
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className={`bg-[#F6F7F9] overflow-hidden ${index === 0 ? 'h-64' : 'h-48'}`}>
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                        <Tag size={48} />
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  {post.category && (
                    <span className="inline-block px-3 py-1 bg-[#D4A23F]/10 text-[#D4A23F] text-xs font-semibold rounded-full mb-3">
                      {post.category}
                    </span>
                  )}
                  
                  {/* Title */}
                  <h2 className={`font-['Space_Grotesk'] font-bold text-[#0B0F17] mb-3 hover:text-[#D4A23F] transition-colors ${
                    index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'
                  }`}>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  
                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-[#6B7280] mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                    {post.author_name && (
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {post.author_name}
                      </span>
                    )}
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(post.published_at)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      
      <SimpleFooter />
    </div>
  );
}
