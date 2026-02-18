import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Globe, Calendar, Check, Instagram, Linkedin, Home, Building2, ThumbsUp, Shield, X, CheckCircle } from 'lucide-react';
import type { Manager } from '@/types';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

interface SocialLinks {
  website?: string;
  airbnb?: string;
  instagram?: string;
  linkedin?: string;
  contact?: string;
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
  manager_response: string;
  manager_responded_at: string;
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

export default function ManagerDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [manager, setManager] = useState<Manager | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMetrics, setReviewMetrics] = useState<ReviewMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewSort, setReviewSort] = useState('newest');
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(searchParams.get('write_review') === 'true');
  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    email: '',
    is_verified_owner: false,
    rating: 5,
    comment: '',
    booking_performance: 5,
    property_care: 5,
    guest_satisfaction: 5,
    communication: 5,
    financial_transparency: 5,
    would_recommend: true,
    property_address: '',
    stay_duration: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (slug) {
      loadManager(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (manager) {
      loadReviews();
    }
  }, [manager, reviewSort]);

  const loadManager = async (managerSlug: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/managers/${managerSlug}`);
      if (response.ok) {
        const data = await response.json();
        setManager(data);
        setReviewMetrics(data.review_metrics || null);
        
        if (data.social_links) {
          try {
            setSocialLinks(typeof data.social_links === 'string' ? JSON.parse(data.social_links) : data.social_links);
          } catch (e) {
            setSocialLinks({});
          }
        }
      }
    } catch (error) {
      console.error('Failed to load manager:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!manager) return;
    try {
      const response = await fetch(`${API_URL}/managers/${manager.id}/reviews?sort=${reviewSort}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manager) return;
    
    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${API_URL}/managers/${manager.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: reviewForm.user_name,
          email: reviewForm.email,
          is_verified_owner: reviewForm.is_verified_owner,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          booking_performance: reviewForm.booking_performance,
          property_care: reviewForm.property_care,
          guest_satisfaction: reviewForm.guest_satisfaction,
          communication: reviewForm.communication,
          financial_transparency: reviewForm.financial_transparency,
          would_recommend: reviewForm.would_recommend,
          property_address: reviewForm.property_address,
          stay_duration: reviewForm.stay_duration
        })
      });
      
      if (response.ok) {
        setReviewSubmitted(true);
        setReviewForm({
          user_name: '',
          email: '',
          is_verified_owner: false,
          rating: 5,
          comment: '',
          booking_performance: 5,
          property_care: 5,
          guest_satisfaction: 5,
          communication: 5,
          financial_transparency: 5,
          would_recommend: true,
          property_address: '',
          stay_duration: ''
        });
        setTimeout(() => {
          setShowReviewForm(false);
          setReviewSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={interactive ? 28 : 18}
              className={star <= rating ? 'text-[#D4A23F] fill-[#D4A23F]' : 'text-[#E5E7EB]'}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderMetricBar = (label: string, value: number) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-[#6B7280]">{label}</span>
        <span className="text-sm font-medium text-[#0B0F17]">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#D4A23F] rounded-full transition-all duration-500"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

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

  if (!manager) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold text-[#0B0F17] mb-4">Manager Not Found</h1>
          <Link to="/managers" className="text-[#D4A23F] hover:underline">
            Browse All Managers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Cover Image */}
      <div className="h-64 lg:h-80 bg-[#0B0F17] relative">
        {manager.cover_image_url ? (
          <img
            src={manager.cover_image_url}
            alt={manager.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] to-transparent" />
      </div>

      {/* Content */}
      <div className="w-full px-6 lg:px-[6vw] -mt-20 relative z-10 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 card-shadow-lg mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Logo */}
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl bg-[#F6F7F9] flex items-center justify-center flex-shrink-0">
                {manager.logo_url ? (
                  <img src={manager.logo_url} alt={manager.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl font-bold text-[#D4A23F]">
                    {manager.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="font-['Space_Grotesk'] font-bold text-2xl lg:text-3xl text-[#0B0F17]">
                      {manager.name}
                    </h1>
                    <p className="text-[#6B7280] flex items-center gap-1 mt-1">
                      <MapPin size={16} />
                      {manager.location_name}
                      {manager.address && ` • ${manager.address}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {manager.is_verified && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                        <Shield size={14} />
                        Verified
                      </span>
                    )}
                    {manager.is_featured && (
                      <span className="px-3 py-1 bg-[#D4A23F] text-white text-sm font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(reviewMetrics?.overall_score || manager.rating) ? 'text-[#D4A23F] fill-[#D4A23F]' : 'text-[#E5E7EB]'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#0B0F17]">{reviewMetrics?.overall_score?.toFixed(1) || manager.rating}</span>
                  <span className="text-[#6B7280]">({reviewMetrics?.total_reviews || manager.review_count} reviews)</span>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F7F9] text-[#0B0F17] rounded-lg text-sm hover:bg-[#0B0F17] hover:text-white transition-colors"
                    >
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                  {socialLinks.airbnb && (
                    <a
                      href={socialLinks.airbnb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5A5F] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                      <Home size={14} />
                      Airbnb
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                      <Instagram size={14} />
                      {socialLinks.instagram}
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://linkedin.com/company/${socialLinks.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                      <Linkedin size={14} />
                      LinkedIn
                    </a>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {manager.phone && (
                    <a
                      href={`tel:${manager.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F6F7F9] text-[#0B0F17] rounded-lg hover:bg-[#0B0F17] hover:text-white transition-colors"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}
                  {manager.email && (
                    <a
                      href={`mailto:${manager.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F6F7F9] text-[#0B0F17] rounded-lg hover:bg-[#0B0F17] hover:text-white transition-colors"
                    >
                      <Mail size={16} />
                      Email
                    </a>
                  )}
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A23F] text-white rounded-lg hover:bg-[#B88A2F] transition-colors"
                  >
                    <Star size={16} />
                    Write a Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {manager.description && (
                <div className="bg-white rounded-2xl p-6 lg:p-8 card-shadow">
                  <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17] mb-4">
                    About
                  </h2>
                  <p className="text-[#6B7280] leading-relaxed">
                    {manager.description}
                  </p>
                </div>
              )}

              {/* Services */}
              {manager.services && manager.services.length > 0 && (
                <div className="bg-white rounded-2xl p-6 lg:p-8 card-shadow">
                  <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17] mb-4">
                    Services
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {manager.services.map((service) => (
                      <div key={service} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#D4A23F]/10 flex items-center justify-center flex-shrink-0">
                          <Check size={14} className="text-[#D4A23F]" />
                        </div>
                        <span className="text-[#0B0F17]">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Metrics */}
              {reviewMetrics && reviewMetrics.total_reviews > 0 && (
                <div className="bg-white rounded-2xl p-6 lg:p-8 card-shadow">
                  <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17] mb-4">
                    Review Scores
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-[#F6F7F9] rounded-xl">
                      <p className="text-4xl font-bold text-[#D4A23F]">{reviewMetrics.overall_score.toFixed(1)}</p>
                      <p className="text-sm text-[#6B7280]">Overall Score</p>
                    </div>
                    <div className="text-center p-4 bg-[#F6F7F9] rounded-xl">
                      <p className="text-4xl font-bold text-green-600">{reviewMetrics.would_recommend_percentage}%</p>
                      <p className="text-sm text-[#6B7280]">Would Recommend</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    {renderMetricBar('Booking Performance', reviewMetrics.booking_performance)}
                    {renderMetricBar('Property Care & Maintenance', reviewMetrics.property_care)}
                    {renderMetricBar('Guest Satisfaction', reviewMetrics.guest_satisfaction)}
                    {renderMetricBar('Communication & Responsiveness', reviewMetrics.communication)}
                    {renderMetricBar('Financial Transparency', reviewMetrics.financial_transparency)}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 card-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17]">
                    Reviews ({reviewMetrics?.total_reviews || 0})
                  </h2>
                  <div className="flex gap-3">
                    <select 
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value)}
                      className="px-4 py-2 border border-[#0B0F17]/10 rounded-lg text-sm focus:outline-none focus:border-[#D4A23F]"
                    >
                      <option value="newest">Newest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                      <option value="verified">Verified Owners</option>
                    </select>
                    <button 
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-[#D4A23F] text-white rounded-lg text-sm hover:bg-[#B88A2F] transition-colors"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star size={48} className="mx-auto text-[#E5E7EB] mb-4" />
                    <p className="text-[#6B7280]">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-[#0B0F17]/8 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'text-[#D4A23F] fill-[#D4A23F]' : 'text-[#E5E7EB]'}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-[#0B0F17]">{review.user_name}</span>
                          {review.is_verified_owner === 1 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle size={12} />
                              Verified Owner
                            </span>
                          )}
                          {review.would_recommend === 1 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                              <ThumbsUp size={12} />
                              Would Recommend
                            </span>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-[#6B7280] mb-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-[#6B7280]">
                          {new Date(review.created_at).toLocaleDateString()}
                          {review.stay_duration && ` · Stayed ${review.stay_duration}`}
                        </p>
                        
                        {/* Manager Response */}
                        {review.manager_response && (
                          <div className="mt-3 p-3 bg-[#F6F7F9] rounded-lg">
                            <p className="text-sm font-medium text-[#0B0F17] mb-1">Response from {manager.name}:</p>
                            <p className="text-sm text-[#6B7280]">{review.manager_response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#0B0F17] mb-4">
                  Quick Info
                </h3>
                <div className="space-y-4">
                  {manager.founded_year && (
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-[#D4A23F]" />
                      <div>
                        <p className="text-sm text-[#6B7280]">Founded</p>
                        <p className="font-medium text-[#0B0F17]">{manager.founded_year}</p>
                      </div>
                    </div>
                  )}
                  {(manager as any).listings_count > 0 && (
                    <div className="flex items-center gap-3">
                      <Building2 size={18} className="text-[#D4A23F]" />
                      <div>
                        <p className="text-sm text-[#6B7280]">Properties Managed</p>
                        <p className="font-medium text-[#0B0F17]">{(manager as any).listings_count}</p>
                      </div>
                    </div>
                  )}
                  {manager.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-[#D4A23F]" />
                      <div>
                        <p className="text-sm text-[#6B7280]">Phone</p>
                        <p className="font-medium text-[#0B0F17]">{manager.phone}</p>
                      </div>
                    </div>
                  )}
                  {manager.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-[#D4A23F]" />
                      <div>
                        <p className="text-sm text-[#6B7280]">Email</p>
                        <p className="font-medium text-[#0B0F17]">{manager.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Claim Listing */}
              {!manager.is_claimed && (
                <div className="bg-[#D4A23F]/10 rounded-2xl p-6">
                  <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#0B0F17] mb-2">
                    Is this your business?
                  </h3>
                  <p className="text-[#6B7280] text-sm mb-4">
                    Claim this listing to update your information and respond to reviews.
                  </p>
                  <Link 
                    to={`/claim-listing/${manager.slug}`}
                    className="block w-full py-3 bg-[#D4A23F] text-white text-center font-semibold rounded-xl hover:bg-[#B88A2F] transition-colors"
                  >
                    Claim Listing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0B0F17]">Write a Review</h3>
              <button 
                onClick={() => setShowReviewForm(false)}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            {reviewSubmitted ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h4 className="text-xl font-bold text-[#0B0F17] mb-2">Thank You!</h4>
                <p className="text-[#6B7280]">Your review has been submitted and is pending approval.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Your Name *</label>
                    <input 
                      type="text"
                      required
                      value={reviewForm.user_name}
                      onChange={(e) => setReviewForm({...reviewForm, user_name: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Email</label>
                    <input 
                      type="email"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Verified Owner */}
                <div className="flex items-center gap-3 p-4 bg-[#F6F7F9] rounded-xl">
                  <input 
                    type="checkbox"
                    id="verified_owner"
                    checked={reviewForm.is_verified_owner}
                    onChange={(e) => setReviewForm({...reviewForm, is_verified_owner: e.target.checked})}
                    className="w-5 h-5 text-[#D4A23F] rounded focus:ring-[#D4A23F]"
                  />
                  <label htmlFor="verified_owner" className="text-sm text-[#0B0F17]">
                    I am a verified property owner who has used this company's services
                  </label>
                </div>

                {/* Property Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Property Address</label>
                    <input 
                      type="text"
                      value={reviewForm.property_address}
                      onChange={(e) => setReviewForm({...reviewForm, property_address: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                      placeholder="Downtown Dubai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-1">Stay Duration</label>
                    <select 
                      value={reviewForm.stay_duration}
                      onChange={(e) => setReviewForm({...reviewForm, stay_duration: e.target.value})}
                      className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    >
                      <option value="">Select duration</option>
                      <option value="Less than 1 month">Less than 1 month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="Over 1 year">Over 1 year</option>
                    </select>
                  </div>
                </div>

                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">Overall Rating *</label>
                  {renderStars(reviewForm.rating, true, (r) => setReviewForm({...reviewForm, rating: r}))}
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[#0B0F17]">Rate Specific Areas</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#6B7280] mb-1">Booking Performance</label>
                      <select 
                        value={reviewForm.booking_performance}
                        onChange={(e) => setReviewForm({...reviewForm, booking_performance: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-[#0B0F17]/10 rounded-lg focus:outline-none focus:border-[#D4A23F]"
                      >
                        {[5, 4, 3, 2, 1].map(n => (
                          <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Good' : n === 3 ? 'Average' : n === 2 ? 'Poor' : 'Very Poor'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#6B7280] mb-1">Property Care & Maintenance</label>
                      <select 
                        value={reviewForm.property_care}
                        onChange={(e) => setReviewForm({...reviewForm, property_care: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-[#0B0F17]/10 rounded-lg focus:outline-none focus:border-[#D4A23F]"
                      >
                        {[5, 4, 3, 2, 1].map(n => (
                          <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Good' : n === 3 ? 'Average' : n === 2 ? 'Poor' : 'Very Poor'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#6B7280] mb-1">Guest Satisfaction</label>
                      <select 
                        value={reviewForm.guest_satisfaction}
                        onChange={(e) => setReviewForm({...reviewForm, guest_satisfaction: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-[#0B0F17]/10 rounded-lg focus:outline-none focus:border-[#D4A23F]"
                      >
                        {[5, 4, 3, 2, 1].map(n => (
                          <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Good' : n === 3 ? 'Average' : n === 2 ? 'Poor' : 'Very Poor'}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#6B7280] mb-1">Communication & Responsiveness</label>
                      <select 
                        value={reviewForm.communication}
                        onChange={(e) => setReviewForm({...reviewForm, communication: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-[#0B0F17]/10 rounded-lg focus:outline-none focus:border-[#D4A23F]"
                      >
                        {[5, 4, 3, 2, 1].map(n => (
                          <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Good' : n === 3 ? 'Average' : n === 2 ? 'Poor' : 'Very Poor'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-1">Financial Transparency</label>
                    <select 
                      value={reviewForm.financial_transparency}
                      onChange={(e) => setReviewForm({...reviewForm, financial_transparency: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-[#0B0F17]/10 rounded-lg focus:outline-none focus:border-[#D4A23F]"
                    >
                      {[5, 4, 3, 2, 1].map(n => (
                        <option key={n} value={n}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Good' : n === 3 ? 'Average' : n === 2 ? 'Poor' : 'Very Poor'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Would Recommend */}
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    id="would_recommend"
                    checked={reviewForm.would_recommend}
                    onChange={(e) => setReviewForm({...reviewForm, would_recommend: e.target.checked})}
                    className="w-5 h-5 text-[#D4A23F] rounded focus:ring-[#D4A23F]"
                  />
                  <label htmlFor="would_recommend" className="text-sm text-[#0B0F17]">
                    I would recommend this company to other property owners
                  </label>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-1">Your Review *</label>
                  <textarea 
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F]"
                    placeholder="Share your experience with this property management company..."
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4 border-t border-[#0B0F17]/10">
                  <button 
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-6 py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingReview || !reviewForm.user_name || !reviewForm.comment}
                    className="flex-1 btn-gold px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      <SimpleFooter />
    </div>
  );
}
