import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Calendar, User, X, Image } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  is_published: number;
  published_at: string;
  author_name?: string;
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string;
  is_published: boolean;
}

const initialFormData: PostFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  category: '',
  tags: '',
  is_published: false
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/blog?limit=100`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title)
    }));
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || '',
      category: post.category || '',
      tags: post.tags ? post.tags.join(', ') : '',
      is_published: post.is_published === 1
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingPost 
        ? `${API_URL}/blog/${editingPost.id}`
        : `${API_URL}/blog`;
      
      const method = editingPost ? 'PUT' : 'POST';
      
      const body = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        closeModal();
        fetchPosts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post');
    } finally {
      setIsSubmitting(false);
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
        <button 
          onClick={openCreateModal}
          className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
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
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden card-shadow">
            {/* Cover Image */}
            <div className="h-48 bg-[#F6F7F9] overflow-hidden">
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                  <Image size={48} />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.is_published 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
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
                  <button 
                    onClick={() => openEditModal(post)}
                    className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600"
                  >
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
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-[#6B7280]">No posts found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#0B0F17]">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder="Enter post title"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder="post-url-slug"
                  required
                />
                <p className="text-xs text-[#6B7280] mt-1">This will be the URL: /blog/{formData.slug}</p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none h-20"
                  placeholder="Brief summary of the post"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none h-64 font-mono text-sm"
                  placeholder="<p>Your post content here...</p>"
                  required
                />
                <p className="text-xs text-[#6B7280] mt-1">HTML content supported</p>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Featured Image URL
                </label>
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder="/blog-image.jpg or https://example.com/image.jpg"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder="e.g., Guide, Strategy, Regulations"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  className="w-5 h-5 rounded border-[#0B0F17]/20 text-[#D4A23F] focus:ring-[#D4A23F]"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-[#0B0F17]">
                  Publish immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-[#0B0F17]/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-gold px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
