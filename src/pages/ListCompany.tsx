import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, User, Globe, Instagram, Linkedin, Send } from 'lucide-react';
import Navigation from '@/sections/Navigation';

export default function ListCompany() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    instagram: '',
    linkedin: '',
    yearFounded: '',
    listingsCount: '',
    locations: [] as string[],
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const locations = [
    'Palm Jumeirah',
    'Downtown Dubai',
    'Dubai Marina',
    'JBR',
    'Arabian Ranches',
    'Business Bay'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send data to backend
    setSubmitted(true);
  };

  const handleLocationToggle = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-[#D4A23F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="text-[#D4A23F]" size={32} />
            </div>
            <h1 className="font-['Space_Grotesk'] font-bold text-3xl text-[#0B0F17] mb-4">
              Application Submitted!
            </h1>
            <p className="text-[#6B7280] mb-8">
              Thank you for your interest in listing your company on BNBinsights. Our team will review your application and get back to you within 2-3 business days.
            </p>
            <Link to="/" className="btn-gold px-8 py-3 rounded-xl font-semibold inline-block">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#0B0F17] pt-24 pb-12">
        <div className="w-full px-6 lg:px-[6vw]">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-[#D4A23F] mb-6">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            List Your Company
          </h1>
          <p className="text-[#A7B1C2] max-w-2xl">
            Join Dubai's leading directory of vacation rental management companies. Reach thousands of property owners looking for trusted managers.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 lg:p-10 card-shadow">
            <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17] mb-6">
              Company Information
            </h2>

            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Contact Person *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="Full name"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Instagram
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="@handle"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    LinkedIn
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="company-name"
                    />
                  </div>
                </div>
              </div>

              {/* Year & Listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Year Founded
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max={new Date().getFullYear()}
                    value={formData.yearFounded}
                    onChange={(e) => setFormData({ ...formData, yearFounded: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="2015"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Properties Under Management
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.listingsCount}
                    onChange={(e) => setFormData({ ...formData, listingsCount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-3">
                  Areas You Serve *
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => handleLocationToggle(location)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.locations.includes(location)
                          ? 'bg-[#D4A23F] text-white'
                          : 'bg-[#F6F7F9] text-[#6B7280] hover:bg-[#0B0F17]/5'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Additional Information
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none resize-none"
                  placeholder="Tell us more about your company and services..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full btn-gold py-4 rounded-xl font-semibold text-lg"
              >
                Submit Application
              </button>

              <p className="text-center text-sm text-[#6B7280]">
                By submitting, you agree to our{' '}
                <Link to="/terms" className="text-[#D4A23F] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#D4A23F] hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
