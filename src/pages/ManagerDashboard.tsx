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
  X,
  CheckCircle,
  XCircle,
  Flag,
  Reply,
  Globe,
  Phone,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Bell
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
  location_id: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  founded_year: number;
  services: string[];
  social_links: {
    website?: string;
    airbnb?: string;
    instagram?: string;
    linkedin?: string;
    contact?: string;
  };
}

interface Review {
  id: number;
  user_name: string;
  email: string;
  is_verified_owner: number;
  rating: number;
  comment: string;
  booking_performance: number;
  property_care: number;
  guest_satisfaction: number;
  communication: number;
  financial_transparency: number;
  would_recommend: number;
  property_address: string;
  stay_duration: string;
  status: 'pending' | 'approved' | 'rejected';
  manager_response: string;
  manager_responded_at: string;
  is_flagged: number;
  flag_reason: string;
  created_at: string;
}

interface ReviewMetrics {
  overall_score: number;
  booking_performance: number;
  property_care: number;
  guest_satisfaction: number;
  communication: number;
  financial_transparency: number;
  would_recommend_percentage: number;
  total_reviews: number;
}

export default function ManagerDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [manager, setManager] = useState<Manager | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMetrics, setReviewMetrics] = useState<ReviewMetrics | null>(null);
  const [stats, setStats] = useState({
    views: 0,
    inquiries: 0,
    avgRating: 0
  });
  
  // Tab and Modal State
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'settings'>('overview');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    listings_count: 0,
    address: '',
    phone: '',
    email: '',
    website: '',
    founded_year: '',
    services: [] as string[],
    social_links: {
      website: '',
      airbnb: '',
      instagram: '',
      linkedin: '',
      contact: ''
    }
  });

  // Settings State
  const [settings, setSettings] = useState({
    email_notifications: true,
    review_notifications: true,
    marketing_emails: false,
    public_profile: true,
    show_contact_info: true
  });

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
        
        // Get reviews from dashboard endpoint
        const reviewsRes = await fetch(`${API_URL}/managers/dashboard/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (reviewsRes.ok) {
          const reviewData = await reviewsRes.json();
          setReviews(reviewData.reviews || []);
          setReviewMetrics(reviewData.metrics || null);
        }
        
        // Initialize edit form
        setEditForm({
          name: myManager.name || '',
          description: myManager.description || '',
          listings_count: myManager.listings_count || 0,
          address: myManager.address || '',
          phone: myManager.phone || '',
          email: myManager.email || '',
          website: myManager.website || '',
          founded_year: myManager.founded_year?.toString() || '',
          services: myManager.services || [],
          social_links: myManager.social_links || {
            website: '',
            airbnb: '',
            instagram: '',
            linkedin: '',
            contact: ''
          }
        });
        
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

  const updateReviewStatus = async (reviewId: number, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, status } : r));
      }
    } catch (error) {
      console.error('Failed to update review status:', error);
    }
  };

  const respondToReview = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers/reviews/${selectedReview.id}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ response: responseText })
      });
      
      if (response.ok) {
        setReviews(reviews.map(r => 
          r.id === selectedReview.id 
            ? { ...r, manager_response: responseText, manager_responded_at: new Date().toISOString() }
            : r
        ));
        setShowResponseModal(false);
        setResponseText('');
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('Failed to respond to review:', error);
    }
  };

  const flagReview = async (reviewId: number, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers/reviews/${reviewId}/flag`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, is_flagged: 1, flag_reason: reason } : r
        ));
      }
    } catch (error) {
      console.error('Failed to flag review:', error);
    }
  };

  const saveProfile = async () => {
    if (!manager) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers/${manager.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          listings_count: editForm.listings_count,
          address: editForm.address,
          phone: editForm.phone,
          email: editForm.email,
          website: editForm.website,
          founded_year: editForm.founded_year ? parseInt(editForm.founded_year) : null,
          services: editForm.services,
          social_links: editForm.social_links
        })
      });
      
      if (response.ok) {
        const updatedManager = { 
          ...manager, 
          name: editForm.name,
          description: editForm.description,
          listings_count: editForm.listings_count,
          address: editForm.address,
          phone: editForm.phone,
          email: editForm.email,
          website: editForm.website,
          services: editForm.services,
          social_links: editForm.social_links
        };
        if (editForm.founded_year) {
          (updatedManager as any).founded_year = parseInt(editForm.founded_year);
        }
        setManager(updatedManager);
        setShowEditProfileModal(false);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = async () => {
    // In production, this would save to the backend
    // For now, we'll just show a success state
    alert('Settings saved successfully!');
  };

  const addService = (service: string) => {
    if (service && !editForm.services.includes(service)) {
      setEditForm({ ...editForm, services: [...editForm.services, service] });
    }
  };

  const removeService = (service: string) => {
    setEditForm({ ...editForm, services: editForm.services.filter(s => s !== service) });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const renderMetricBar = (label: string, value: number, color: string) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-[#6B7280]">{label}</span>
        <span className="text-sm font-medium text-[#0B0F17]">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

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
                  {reviews.filter(r => r.status === 'pending').length > 0 && (
                    <span className="mr-1">
                      {reviews.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                  {reviews.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'settings' 
                    ? 'border-[#D4A23F] text-[#D4A23F]' 
                    : 'border-transparent text-[#6B7280] hover:text-[#0B0F17]'
                }`}
              >
                Settings
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
                  <button 
                    onClick={() => setShowEditProfileModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D4A23F] rounded-lg hover:bg-[#b88d35] transition-colors"
                  >
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#6B7280]">Company Name</label>
                        <p className="font-medium text-[#0B0F17]">{manager.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-[#6B7280]">Founded Year</label>
                        <p className="font-medium text-[#0B0F17]">{manager.founded_year || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-[#6B7280]">Location</label>
                      <p className="font-medium text-[#0B0F17]">{manager.location_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-[#6B7280]">Description</label>
                      <p className="text-[#0B0F17]">{manager.description}</p>
                    </div>
                    {manager.services && manager.services.length > 0 && (
                      <div>
                        <label className="text-sm text-[#6B7280]">Services</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {manager.services.map((service, idx) => (
                            <span key={idx} className="px-3 py-1 bg-[#F6F7F9] rounded-full text-sm text-[#0B0F17]">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                  {reviews.filter(r => r.status === 'approved').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#6B7280] mb-4">No approved reviews yet</p>
                      <button 
                        onClick={() => setShowCollectModal(true)}
                        className="btn-gold px-4 py-2 rounded-lg text-sm"
                      >
                        Collect Your First Review
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.filter(r => r.status === 'approved').slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-[#0B0F17]/5 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#0B0F17]">{review.user_name}</span>
                              {review.is_verified_owner === 1 && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Verified Owner
                                </span>
                              )}
                            </div>
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
                    <button 
                      onClick={() => setShowEditProfileModal(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors text-left"
                    >
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
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors text-left"
                    >
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
        ) : activeTab === 'reviews' ? (
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

            {/* Review Metrics */}
            {reviewMetrics && reviewMetrics.total_reviews > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold text-[#0B0F17] mb-4">Overall Score</h3>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-[#D4A23F]">{reviewMetrics.overall_score.toFixed(1)}</p>
                    <p className="text-[#6B7280] mt-2">out of 5.0</p>
                    <div className="mt-4 flex justify-center">
                      {renderStars(Math.round(reviewMetrics.overall_score))}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold text-[#0B0F17] mb-4">Performance Metrics</h3>
                  {renderMetricBar('Booking Performance', reviewMetrics.booking_performance, 'bg-blue-500')}
                  {renderMetricBar('Property Care & Maintenance', reviewMetrics.property_care, 'bg-green-500')}
                  {renderMetricBar('Guest Satisfaction', reviewMetrics.guest_satisfaction, 'bg-purple-500')}
                  {renderMetricBar('Communication & Responsiveness', reviewMetrics.communication, 'bg-amber-500')}
                  {renderMetricBar('Financial Transparency', reviewMetrics.financial_transparency, 'bg-teal-500')}
                </div>
              </div>
            )}

            {/* Review Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 card-shadow text-center">
                <p className="text-4xl font-bold text-[#0B0F17]">{reviews.length}</p>
                <p className="text-[#6B7280]">Total Reviews</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow text-center">
                <p className="text-4xl font-bold text-[#0B0F17]">{reviews.filter(r => r.status === 'pending').length}</p>
                <p className="text-[#6B7280]">Pending</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow text-center">
                <p className="text-4xl font-bold text-[#0B0F17]">{manager.rating || 'N/A'}</p>
                <p className="text-[#6B7280]">Average Rating</p>
              </div>
              <div className="bg-white rounded-2xl p-6 card-shadow text-center">
                <p className="text-4xl font-bold text-[#0B0F17]">
                  {reviewMetrics?.would_recommend_percentage || 0}%
                </p>
                <p className="text-[#6B7280]">Would Recommend</p>
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
                    <div key={review.id} className={`border rounded-xl p-4 ${
                      review.status === 'pending' ? 'border-amber-300 bg-amber-50' : 
                      review.is_flagged ? 'border-red-300 bg-red-50' : 
                      'border-[#0B0F17]/10'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-medium text-[#0B0F17]">{review.user_name}</span>
                            <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full">
                              <Star className="text-amber-600" size={14} fill="currentColor" />
                              <span className="text-sm font-medium text-amber-700">{review.rating}</span>
                            </div>
                            {review.is_verified_owner === 1 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                <CheckCircle size={12} />
                                Verified Owner
                              </span>
                            )}
                            {review.would_recommend === 1 && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Would Recommend
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              review.status === 'approved' ? 'bg-green-100 text-green-700' :
                              review.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </span>
                            {review.is_flagged === 1 && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                                <Flag size={12} />
                                Flagged
                              </span>
                            )}
                          </div>
                          <p className="text-[#0B0F17] mb-2">{review.comment}</p>
                          {review.property_address && (
                            <p className="text-sm text-[#6B7280] mb-1">
                              <MapPin size={14} className="inline mr-1" />
                              {review.property_address}
                            </p>
                          )}
                          <p className="text-xs text-[#6B7280]">
                            {new Date(review.created_at).toLocaleDateString()}
                            {review.stay_duration && ` · Stayed ${review.stay_duration}`}
                          </p>
                          
                          {/* Manager Response */}
                          {review.manager_response && (
                            <div className="mt-3 p-3 bg-[#F6F7F9] rounded-lg">
                              <p className="text-sm font-medium text-[#0B0F17] mb-1">Your Response:</p>
                              <p className="text-sm text-[#6B7280]">{review.manager_response}</p>
                              <p className="text-xs text-[#6B7280] mt-1">
                                Responded on {new Date(review.manager_responded_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                          {review.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateReviewStatus(review.id, 'approved')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve Review"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => updateReviewStatus(review.id, 'rejected')}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject Review"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {review.status === 'approved' && !review.manager_response && (
                            <button 
                              onClick={() => {
                                setSelectedReview(review);
                                setShowResponseModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Respond"
                            >
                              <Reply size={18} />
                            </button>
                          )}
                          {!review.is_flagged && (
                            <button 
                              onClick={() => flagReview(review.id, 'Disputed by manager')}
                              className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Flag for Dispute"
                            >
                              <Flag size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h2 className="text-xl font-bold text-[#0B0F17] mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-[#0B0F17]/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bell className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B0F17]">Email Notifications</p>
                      <p className="text-sm text-[#6B7280]">Receive email updates about your account</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.email_notifications}
                      onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A23F]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#0B0F17]/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Star className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B0F17]">Review Notifications</p>
                      <p className="text-sm text-[#6B7280]">Get notified when you receive new reviews</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.review_notifications}
                      onChange={(e) => setSettings({...settings, review_notifications: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A23F]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#0B0F17]/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B0F17]">Public Profile</p>
                      <p className="text-sm text-[#6B7280]">Make your profile visible to the public</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.public_profile}
                      onChange={(e) => setSettings({...settings, public_profile: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A23F]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#0B0F17]/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Phone className="text-amber-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-[#0B0F17]">Show Contact Info</p>
                      <p className="text-sm text-[#6B7280]">Display phone and email on your profile</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.show_contact_info}
                      onChange={(e) => setSettings({...settings, show_contact_info: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A23F]"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#0B0F17]/10">
                  <button 
                    onClick={saveSettings}
                    className="btn-gold px-6 py-3 rounded-xl font-medium"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
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

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0B0F17]">Edit Profile</h3>
              <button 
                onClick={() => setShowEditProfileModal(false)}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div>
                <h4 className="font-medium text-[#0B0F17] mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-[#D4A23F]" />
                  Company Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Company Name</label>
                    <input 
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0B0F17] mb-1">Founded Year</label>
                      <input 
                        type="number"
                        value={editForm.founded_year}
                        onChange={(e) => setEditForm({...editForm, founded_year: e.target.value})}
                        className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0B0F17] mb-1">Properties Managed</label>
                      <input 
                        type="number"
                        value={editForm.listings_count}
                        onChange={(e) => setEditForm({...editForm, listings_count: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Description</label>
                    <textarea 
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-medium text-[#0B0F17] mb-4 flex items-center gap-2">
                  <Phone size={18} className="text-[#D4A23F]" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Phone</label>
                    <input 
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Email</label>
                    <input 
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Address</label>
                    <input 
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-medium text-[#0B0F17] mb-4 flex items-center gap-2">
                  <LinkIcon size={18} className="text-[#D4A23F]" />
                  Social Links
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Website</label>
                    <input 
                      type="url"
                      value={editForm.social_links.website}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        social_links: {...editForm.social_links, website: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Airbnb Profile</label>
                    <input 
                      type="url"
                      value={editForm.social_links.airbnb}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        social_links: {...editForm.social_links, airbnb: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      placeholder="https://airbnb.com/users/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Instagram</label>
                    <input 
                      type="text"
                      value={editForm.social_links.instagram}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        social_links: {...editForm.social_links, instagram: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">LinkedIn</label>
                    <input 
                      type="url"
                      value={editForm.social_links.linkedin}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        social_links: {...editForm.social_links, linkedin: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-medium text-[#0B0F17] mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#D4A23F]" />
                  Services
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editForm.services.map((service, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#F6F7F9] rounded-full text-sm text-[#0B0F17] flex items-center gap-2">
                      {service}
                      <button 
                        onClick={() => removeService(service)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Add a service..."
                    className="flex-1 px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addService((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button 
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      addService(input.value);
                      input.value = '';
                    }}
                    className="px-4 py-3 bg-[#0B0F17] text-white rounded-xl hover:bg-[#1a1f2e]"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-[#0B0F17]/10">
                <button 
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="flex-1 btn-gold px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0B0F17]">Respond to Review</h3>
              <button 
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseText('');
                  setSelectedReview(null);
                }}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#F6F7F9] rounded-xl p-4">
                <p className="text-sm text-[#6B7280] mb-1">Review from {selectedReview.user_name}</p>
                <p className="text-[#0B0F17]">{selectedReview.comment}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">Your Response</label>
                <textarea 
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  placeholder="Thank you for your feedback..."
                  className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText('');
                    setSelectedReview(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={respondToReview}
                  disabled={!responseText.trim()}
                  className="flex-1 btn-gold px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  Post Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
