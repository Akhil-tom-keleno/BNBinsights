import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  Building2, 
  Star, 
  MessageSquare, 
  Settings,
  LogOut,
  TrendingUp,
  Eye,
  Edit2,
  ExternalLink,
  Plus,
  Copy,
  Check,
  Mail,
  Share2,
  QrCode,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Manager {
  id: number;
  name: string;
  slug: string;
  description: string;
  listings_count: number;
  rating: number;
  review_count: number;
  is_featured: number;
  location_name: string;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ManagerDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [manager, setManager] = useState<Manager | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    views: 0,
    inquiries: 0,
    avgRating: 0
  });
  
  // Review Management State
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchManagerData();
    }
  }, [user]);

  const fetchManagerData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get manager claimed by this user
      const response = await fetch(`${API_URL}/managers?claimed_by=${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const managers = await response.json();
      if (Array.isArray(managers) && managers.length > 0) {
        const myManager = managers[0];
        setManager(myManager);
        
        // Get reviews
        const reviewsRes = await fetch(`${API_URL}/managers/${myManager.slug}`);
        const managerData = await reviewsRes.json();
        setReviews(managerData.reviews || []);
        
        // Mock stats (would come from analytics in production)
        setStats({
          views: Math.floor(Math.random() * 1000) + 500,
          inquiries: Math.floor(Math.random() * 50) + 10,
          avgRating: myManager.rating || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch manager data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getReviewLink = () => {
    if (!manager) return '';
    return `${window.location.origin}/manager/${manager.slug}?write_review=true`;
  };

  const copyReviewLink = () => {
    navigator.clipboard.writeText(getReviewLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getReviewEmailTemplate = () => {
    if (!manager) return '';
    return `Hi there,

We hope you enjoyed your stay with ${manager.name}! 

We would greatly appreciate it if you could take a moment to share your experience by leaving us a review. Your feedback helps us improve and helps other guests make informed decisions.

Leave your review here: ${getReviewLink()}

Thank you for choosing ${manager.name}!

Best regards,
The ${manager.name} Team`;
  };

  const copyEmailTemplate = () => {
    navigator.clipboard.writeText(getReviewEmailTemplate());
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9]">
        <div className="w-12 h-12 border-4 border-[#D4A23F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      {/* Header */}
      <header className="bg-white border-b border-[#0B0F17]/10 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4A23F] rounded-xl flex items-center justify-center">
                <span className="font-['Space_Grotesk'] font-bold text-white text-lg">B</span>
              </div>
              <span className="font-['Space_Grotesk'] font-bold text-[#0B0F17] text-xl hidden sm:block">BNBinsights</span>
            </Link>
            <span className="text-[#6B7280] hidden sm:inline">|</span>
            <h1 className="text-lg font-semibold text-[#0B0F17]">Manager Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4A23F] rounded-full flex items-center justify-center">
                <span className="font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-[#0B0F17]">{user.name}</p>
                <p className="text-sm text-[#6B7280]">Property Manager</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[#F6F7F9] rounded-lg text-[#6B7280] hover:text-red-600"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {manager && (
        <div className="bg-white border-b border-[#0B0F17]/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-[#D4A23F] text-[#D4A23F]' 
                    : 'border-transparent text-[#6B7280] hover:text-[#0B0F17]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'reviews' 
                    ? 'border-[#D4A23F] text-[#D4A23F]' 
                    : 'border-transparent text-[#6B7280] hover:text-[#0B0F17]'
                }`}
              >
                Reviews
                <span className="bg-[#0B0F17] text-white text-xs px-2 py-0.5 rounded-full">
                  {reviews.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="p-6">
        {!manager ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="text-amber-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">No Listing Found</h2>
            <p className="text-[#6B7280] mb-6">
              You don't have a claimed listing yet. Claim your company profile to manage it from this dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/managers" className="btn-gold px-6 py-3 rounded-xl font-medium">
                Find Your Company
              </Link>
              <Link to="/claim-listing/new" className="px-6 py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors">
                Register New Company
              </Link>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-[#0B0F17] to-[#1a1f2e] rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
                  <p className="text-white/70">Manage your {manager.name} profile and track performance.</p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={`/manager/${manager.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink size={18} />
                    View Profile
                  </a>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#D4A23F] rounded-lg hover:bg-[#b88d35] transition-colors">
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="text-blue-600" size={24} />
                  </div>
                  <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                    <TrendingUp size={16} />
                    +12%
                  </span>
                </div>
                <p className="text-3xl font-bold text-[#0B0F17]">{stats.views.toLocaleString()}</p>
                <p className="text-[#6B7280]">Profile Views (30d)</p>
              </div>

              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="text-green-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-[#0B0F17]">{stats.inquiries}</p>
                <p className="text-[#6B7280]">Inquiries</p>
              </div>

              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Star className="text-amber-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-[#0B0F17]">{stats.avgRating || 'N/A'}</p>
                <p className="text-[#6B7280]">Average Rating</p>
              </div>

              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="text-purple-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-[#0B0F17]">{manager.listings_count}</p>
                <p className="text-[#6B7280]">Properties</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold text-[#0B0F17] mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-[#6B7280]">Company Name</label>
                      <p className="font-medium text-[#0B0F17]">{manager.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#6B7280]">Location</label>
                      <p className="font-medium text-[#0B0F17]">{manager.location_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#6B7280]">Description</label>
                      <p className="text-[#0B0F17]">{manager.description}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0B0F17]">Recent Reviews</h3>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className="text-[#D4A23F] text-sm hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#6B7280] mb-4">No reviews yet</p>
                      <button 
                        onClick={() => setShowCollectModal(true)}
                        className="btn-gold px-4 py-2 rounded-lg text-sm"
                      >
                        Collect Your First Review
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-[#0B0F17]/5 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-[#0B0F17]">{review.user_name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="text-amber-400" size={16} fill="currentColor" />
                              <span className="text-sm">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-[#6B7280]">{review.comment}</p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold text-[#0B0F17] mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors text-left">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Edit2 className="text-blue-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F17]">Edit Profile</p>
                        <p className="text-sm text-[#6B7280]">Update company info</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Star className="text-green-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F17]">Manage Reviews</p>
                        <p className="text-sm text-[#6B7280]">View and collect reviews</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors text-left">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Settings className="text-purple-600" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F17]">Settings</p>
                        <p className="text-sm text-[#6B7280]">Account preferences</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Collect Reviews CTA */}
                <div className="bg-gradient-to-br from-[#D4A23F] to-[#b88d35] rounded-2xl p-6 text-white">
                  <h3 className="font-semibold mb-2">Collect More Reviews</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Reviews help build trust and attract more guests. Share your review link with past guests.
                  </p>
                  <button 
                    onClick={() => setShowCollectModal(true)}
                    className="w-full py-2 bg-white text-[#D4A23F] rounded-lg font-medium hover:bg-white/90 transition-colors"
                  >
                    Get Review Link
                  </button>
                </div>

                {/* Support */}
                <div className="bg-[#0B0F17] rounded-2xl p-6 text-white">
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Contact our support team for assistance with your listing.
                  </p>
                  <a 
                    href="mailto:support@bnbinsights.ae"
                    className="inline-flex items-center gap-2 text-[#D4A23F] hover:underline"
                  >
                    support@bnbinsights.ae
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Reviews Tab */
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Reviews Header */}
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0B0F17]">Reviews Management</h2>
                  <p className="text-[#6B7280]">Manage and collect reviews for {manager.name}</p>
                </div>
                <button 
                  onClick={() => setShowCollectModal(true)}
                  className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                >
                  <Plus size={20} />
                  Collect Reviews
                </button>
              </div>
            </div>

            {/* Review Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 card-shadow text-center">
                <p className="text-4xl font-bold text-[#0B0F17]">{reviews.length}</p>
                <p className="text-[#6B7280]">Total Reviews</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow text-center">
                <p className="text-4xl font-bold text-[#0B0F17]">{manager.rating || 'N/A'}</p>
                <p className="text-[#6B7280]">Average Rating</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow text-center">
                <p className="text-4xl font-bold text-[#0B0F17]">
                  {reviews.filter(r => r.rating === 5).length}
                </p>
                <p className="text-[#6B7280]">5-Star Reviews</p>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h3 className="font-semibold text-[#0B0F17] mb-4">All Reviews</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="text-amber-600" size={32} />
                  </div>
                  <h4 className="text-lg font-semibold text-[#0B0F17] mb-2">No Reviews Yet</h4>
                  <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
                    Start collecting reviews from your guests to build trust and attract more bookings.
                  </p>
                  <button 
                    onClick={() => setShowCollectModal(true)}
                    className="btn-gold px-6 py-3 rounded-xl font-medium"
                  >
                    Collect Your First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-[#0B0F17]/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-[#0B0F17]">{review.user_name}</span>
                            <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full">
                              <Star className="text-amber-600" size={14} fill="currentColor" />
                              <span className="text-sm font-medium text-amber-700">{review.rating}</span>
                            </div>
                            <span className="text-sm text-[#6B7280]">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[#0B0F17]">{review.comment}</p>
                        </div>
                        <button 
                          onClick={() => deleteReview(review.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Collect Reviews Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0B0F17]">Collect Reviews</h3>
              <button 
                onClick={() => setShowCollectModal(false)}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Review Link */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Your Review Link
                </label>
                <p className="text-sm text-[#6B7280] mb-3">
                  Share this link with your guests to collect reviews directly on your profile.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={getReviewLink()}
                    readOnly
                    className="flex-1 px-4 py-3 bg-[#F6F7F9] border border-[#0B0F17]/10 rounded-xl text-sm"
                  />
                  <button 
                    onClick={copyReviewLink}
                    className="px-4 py-3 bg-[#0B0F17] text-white rounded-xl hover:bg-[#1a1f2e] transition-colors flex items-center gap-2"
                  >
                    {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={`mailto:?subject=Share your experience with ${manager?.name}&body=${encodeURIComponent(getReviewEmailTemplate())}`}
                  className="flex items-center justify-center gap-2 p-4 border border-[#0B0F17]/10 rounded-xl hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                >
                  <Mail size={20} />
                  <span className="font-medium">Email</span>
                </a>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Review ${manager?.name}`,
                        text: `Share your experience with ${manager?.name}`,
                        url: getReviewLink()
                      });
                    }
                  }}
                  className="flex items-center justify-center gap-2 p-4 border border-[#0B0F17]/10 rounded-xl hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                >
                  <Share2 size={20} />
                  <span className="font-medium">Share</span>
                </button>
              </div>

              {/* Email Template */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Email Template
                </label>
                <p className="text-sm text-[#6B7280] mb-3">
                  Copy this template and send it to your guests via email.
                </p>
                <div className="bg-[#F6F7F9] rounded-xl p-4">
                  <pre className="text-sm text-[#0B0F17] whitespace-pre-wrap font-sans">
                    {getReviewEmailTemplate()}
                  </pre>
                </div>
                <button 
                  onClick={copyEmailTemplate}
                  className="mt-3 w-full py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors flex items-center justify-center gap-2"
                >
                  {copiedEmail ? <Check size={18} /> : <Copy size={18} />}
                  {copiedEmail ? 'Copied!' : 'Copy Email Template'}
                </button>
              </div>

              {/* QR Code Placeholder */}
              <div className="text-center p-6 border border-dashed border-[#0B0F17]/20 rounded-xl">
                <QrCode size={48} className="mx-auto mb-3 text-[#6B7280]" />
                <p className="text-sm text-[#6B7280]">
                  QR Code feature coming soon. Print and display at your properties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
