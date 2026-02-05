import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Calendar, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  is_published: number;
  published_at: string;
  author_name?: string;
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/blog`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/blog/${post.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_published: !post.is_published })
      });
      fetchPosts();
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#D4A23F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B0F17]">Blog Posts</h2>
          <p className="text-[#6B7280]">Manage your blog content</p>
        </div>
        <button className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2">
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 card-shadow">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl p-6 card-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.is_published 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }}`}>
                  {post.is_published ? 'Published' : 'Draft'}
                </span>
                {post.category && (
                  <span className="px-3 py-1 bg-[#F6F7F9] rounded-full text-xs text-[#6B7280]">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleTogglePublish(post)}
                  className="p-2 hover:bg-[#F6F7F9] rounded-lg text-[#6B7280]"
                  title={post.is_published ? 'Unpublish' : 'Publish'}
                >
                  <Eye size={18} />
                </button>
                <button className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-[#0B0F17] text-lg mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">{post.excerpt}</p>

            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {post.published_at 
                  ? new Date(post.published_at).toLocaleDateString() 
                  : 'Not published'}
              </span>
              {post.author_name && (
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {post.author_name}
                </span>
              )}
            </div>

            <a 
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[#D4A23F] hover:underline text-sm"
            >
              <Eye size={16} />
              View Post
            </a>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-[#6B7280]">No posts found</p>
        </div>
      )}
    </div>
  );
}
