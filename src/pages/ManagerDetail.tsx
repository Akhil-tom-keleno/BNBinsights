import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Globe, Calendar, Check, MessageSquare, Users, Instagram, Linkedin, Home, Building2 } from 'lucide-react';
import type { Manager } from '@/types';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

interface SocialLinks {
  website?: string;
  airbnb?: string;
  instagram?: string;
  linkedin?: string;
}

interface TeamMember {
  name: string;
  role: string;
}

export default function ManagerDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [manager, setManager] = useState<Manager | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (slug) {
      loadManager(slug);
    }
  }, [slug]);

  const loadManager = async (managerSlug: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/managers/${managerSlug}`);
      if (response.ok) {
        const data = await response.json();
        setManager(data);
        
        if (data.social_links) {
          try {
            setSocialLinks(JSON.parse(data.social_links));
          } catch (e) {
            setSocialLinks({});
          }
        }
        
        if (data.team_members) {
          try {
            setTeamMembers(JSON.parse(data.team_members));
          } catch (e) {
            setTeamMembers([]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load manager:', error);
    } finally {
      setIsLoading(false);
    }
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

                  {manager.is_featured && (
                    <span className="px-3 py-1 bg-[#D4A23F] text-white text-sm font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(manager.rating) ? 'text-[#D4A23F] fill-[#D4A23F]' : 'text-[#E5E7EB]'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#0B0F17]">{manager.rating}</span>
                  <span className="text-[#6B7280]">({manager.review_count} reviews)</span>
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
                      href={`https://linkedin.com/company/${socialLinks.linkedin}`}
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
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A23F] text-white rounded-lg hover:bg-[#B88A2F] transition-colors">
                    <MessageSquare size={16} />
                    Contact
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

              {/* Team Members */}
              {teamMembers.length > 0 && (
                <div className="bg-white rounded-2xl p-6 lg:p-8 card-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-[#D4A23F]" size={22} />
                    <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17]">
                      Team
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[#F6F7F9] rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-[#D4A23F]/10 flex items-center justify-center">
                          <span className="text-[#D4A23F] font-semibold">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#0B0F17]">{member.name}</p>
                          <p className="text-sm text-[#6B7280]">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {manager.reviews && manager.reviews.length > 0 && (
                <div className="bg-white rounded-2xl p-6 lg:p-8 card-shadow">
                  <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17] mb-4">
                    Reviews
                  </h2>
                  <div className="space-y-6">
                    {manager.reviews.map((review) => (
                      <div key={review.id} className="border-b border-[#0B0F17]/8 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
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
                        </div>
                        {review.comment && (
                          <p className="text-[#6B7280]">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
      
      <SimpleFooter />
    </div>
  );
}
