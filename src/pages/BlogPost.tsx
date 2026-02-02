import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import type { BlogPost as BlogPostType } from '@/types';
import { useBlog } from '@/hooks/useApi';
import Navigation from '@/sections/Navigation';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const { getPost, isLoading } = useBlog();

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    const data = await getPost(postSlug);
    if (data) setPost(data as BlogPostType);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A23F]"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold text-[#0B0F17] mb-4">Article Not Found</h1>
          <Link to="/blog" className="text-[#D4A23F] hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Hero */}
      <div className="bg-[#0B0F17] pt-24 pb-16">
        <div className="w-full px-6 lg:px-[6vw] max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#A7B1C2] mb-6">
            <Link to="/" className="hover:text-[#D4A23F]">Home</Link>
            <ArrowLeft size={14} className="rotate-180" />
            <Link to="/blog" className="hover:text-[#D4A23F]">Blog</Link>
            <ArrowLeft size={14} className="rotate-180" />
            <span className="text-white truncate">{post.title}</span>
          </nav>
          
          {/* Category */}
          {post.category && (
            <span className="inline-block px-3 py-1 bg-[#D4A23F]/20 text-[#D4A23F] text-sm font-semibold rounded-full mb-4">
              {post.category}
            </span>
          )}
          
          {/* Title */}
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-6">
            {post.title}
          </h1>
          
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-[#A7B1C2]">
            {post.author_name && (
              <span className="flex items-center gap-2">
                <User size={18} />
                {post.author_name}
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-2">
                <Calendar size={18} />
                {formatDate(post.published_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="w-full max-w-5xl mx-auto px-6 -mt-8">
          <div className="rounded-2xl overflow-hidden card-shadow-lg">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 lg:h-96 object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="w-full px-6 lg:px-[6vw] py-12">
        <div className="max-w-3xl mx-auto">
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-[#6B7280] leading-relaxed mb-8 italic border-l-4 border-[#D4A23F] pl-6">
              {post.excerpt}
            </p>
          )}
          
          {/* Main Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-['Space_Grotesk'] prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-a:text-[#D4A23F] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#0B0F17] prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#0B0F17]/10">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-[#6B7280]" />
                <span className="text-[#6B7280] font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#F6F7F9] text-[#6B7280] text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Share */}
          <div className="mt-8 pt-8 border-t border-[#0B0F17]/10">
            <div className="flex items-center gap-4">
              <span className="text-[#6B7280] font-medium flex items-center gap-2">
                <Share2 size={18} />
                Share this article
              </span>
              <div className="flex gap-2">
                <button className="p-2 bg-[#1DA1F2] text-white rounded-full hover:opacity-80 transition-opacity">
                  <Twitter size={18} />
                </button>
                <button className="p-2 bg-[#0A66C2] text-white rounded-full hover:opacity-80 transition-opacity">
                  <Linkedin size={18} />
                </button>
                <button className="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-80 transition-opacity">
                  <Facebook size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Back to Blog */}
      <div className="w-full px-6 lg:px-[6vw] pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#D4A23F] font-semibold hover:underline"
          >
            <ArrowLeft size={18} />
            Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
