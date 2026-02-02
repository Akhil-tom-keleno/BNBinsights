import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Home, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import Navigation from '@/sections/Navigation';

export default function GetStarted() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    propertyType: '',
    bedrooms: '',
    startDate: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const locations = [
    'Palm Jumeirah',
    'Downtown Dubai',
    'Dubai Marina',
    'JBR',
    'Arabian Ranches',
    'Business Bay',
    'Other'
  ];

  const propertyTypes = [
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Studio'
  ];

  const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-[#D4A23F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-[#D4A23F]" size={32} />
            </div>
            <h1 className="font-['Space_Grotesk'] font-bold text-3xl text-[#0B0F17] mb-4">
              Request Submitted!
            </h1>
            <p className="text-[#6B7280] mb-4">
              Thank you for your interest! Our team will match you with the best property managers in your area.
            </p>
            <p className="text-[#6B7280] mb-8">
              Expect to hear from us within 24 hours with personalized recommendations.
            </p>
            <Link to="/managers" className="btn-gold px-8 py-3 rounded-xl font-semibold inline-block mr-4">
              Browse Managers
            </Link>
            <Link to="/" className="px-8 py-3 rounded-xl font-semibold inline-block border border-[#0B0F17]/10 hover:bg-[#0B0F17]/5">
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
            Get Started
          </h1>
          <p className="text-[#A7B1C2] max-w-2xl">
            Tell us about your property and we'll connect you with the perfect property management company for your needs.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 lg:p-10 card-shadow">
            <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17] mb-6">
              Property Owner Information
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="Your full name"
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
                      placeholder="you@email.com"
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

              <hr className="border-[#0B0F17]/8" />

              <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17]">
                Property Details
              </h2>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Property Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none appearance-none bg-white"
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type & Bedrooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Property Type *
                  </label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                    <select
                      required
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none appearance-none bg-white"
                    >
                      <option value="">Select type</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Bedrooms *
                  </label>
                  <select
                    required
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none appearance-none bg-white"
                  >
                    <option value="">Select</option>
                    {bedroomOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  When do you want to start? *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                  <select
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none appearance-none bg-white"
                  >
                    <option value="">Select timeframe</option>
                    <option value="asap">As soon as possible</option>
                    <option value="1-2-weeks">Within 1-2 weeks</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="just-looking">Just looking / researching</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Tell us more about your needs
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-[#6B7280]" size={20} />
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none resize-none"
                    placeholder="Any specific requirements, questions, or details about your property..."
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full btn-gold py-4 rounded-xl font-semibold text-lg"
              >
                Get Matched with Managers
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
