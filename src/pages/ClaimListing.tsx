import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, User, Mail, Phone, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Manager {
  id: number;
  name: string;
  slug: string;
  description: string;
  location_name?: string;
  listings_count: number;
}

export default function ClaimListing() {
  const { managerId } = useParams<{ managerId: string }>();
  
  const [manager, setManager] = useState<Manager | null>(null);
  const [isLoadingManager, setIsLoadingManager] = useState(true);
  
  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Company Info
    companyName: '',
    website: '',
    yearFounded: '',
    teamSize: '',
    // Personal Info
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    // Account
    password: '',
    confirmPassword: '',
    // Additional
    howDidYouHear: '',
    message: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (managerId && managerId !== 'new') {
      fetchManager();
    } else {
      setIsLoadingManager(false);
    }
  }, [managerId]);

  const fetchManager = async () => {
    try {
      const response = await fetch(`${API_URL}/managers/${managerId}`);
      if (response.ok) {
        const data = await response.json();
        setManager(data);
        setFormData(prev => ({ ...prev, companyName: data.name }));
      }
    } catch (error) {
      console.error('Failed to fetch manager:', error);
    } finally {
      setIsLoadingManager(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStep = () => {
    setError('');
    
    if (step === 1) {
      if (!formData.companyName.trim()) return setError('Company name is required'), false;
      if (!formData.website.trim()) return setError('Website is required'), false;
    }
    
    if (step === 2) {
      if (!formData.fullName.trim()) return setError('Full name is required'), false;
      if (!formData.email.trim()) return setError('Email is required'), false;
      if (!formData.phone.trim()) return setError('Phone number is required'), false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) return setError('Please enter a valid email'), false;
    }
    
    if (step === 3) {
      if (!formData.password) return setError('Password is required'), false;
      if (formData.password.length < 6) return setError('Password must be at least 6 characters'), false;
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/managers/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: managerId !== 'new' ? managerId : null,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingManager) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#D4A23F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F6F7F9]">
        <Navigation />
        
        <div className="bg-[#0B0F17] pt-24 pb-12">
          <div className="w-full px-6 lg:px-[6vw]">
            <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
              Claim Submitted
            </h1>
          </div>
        </div>

        <div className="w-full px-6 lg:px-[6vw] py-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl p-8 card-shadow text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">Thank You!</h2>
              <p className="text-[#6B7280] mb-6">
                Your claim for <strong>{formData.companyName}</strong> has been submitted successfully. 
                Our team will review your application and contact you within 24-48 hours.
              </p>
              <div className="space-y-3">
                <Link to="/" className="block w-full btn-gold py-3 rounded-xl font-semibold">
                  Return to Homepage
                </Link>
                <Link to="/managers" className="block text-[#D4A23F] hover:underline">
                  Browse All Managers
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#0B0F17] pt-24 pb-12">
        <div className="w-full px-6 lg:px-[6vw]">
          <Link to="/managers" className="inline-flex items-center gap-2 text-white/70 hover:text-[#D4A23F] mb-6">
            <ArrowLeft size={18} />
            Back to Managers
          </Link>
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            Claim Your Listing
          </h1>
          <p className="text-[#A7B1C2] max-w-xl">
            {manager 
              ? `Verify your ownership of ${manager.name} and take control of your profile.`
              : 'Register your property management company and reach more property owners.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {['Company Info', 'Contact Details', 'Create Account'].map((label, index) => (
                <div key={label} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${step > index + 1 ? 'bg-green-500 text-white' : ''}
                    ${step === index + 1 ? 'bg-[#D4A23F] text-white' : ''}
                    ${step < index + 1 ? 'bg-[#0B0F17]/10 text-[#6B7280]' : ''}
                  `}>
                    {step > index + 1 ? <CheckCircle size={20} /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:block ${step === index + 1 ? 'text-[#0B0F17] font-medium' : 'text-[#6B7280]'}`}>
                    {label}
                  </span>
                  {index < 2 && (
                    <div className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 ${step > index + 1 ? 'bg-green-500' : 'bg-[#0B0F17]/10'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 card-shadow">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {/* Step 1: Company Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      <Building2 className="inline mr-2" size={16} />
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="Your company name"
                      readOnly={!!manager}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Website *
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="https://yourcompany.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                        Year Founded
                      </label>
                      <input
                        type="number"
                        name="yearFounded"
                        value={formData.yearFounded}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                        placeholder="2015"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                        Team Size
                      </label>
                      <select
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      >
                        <option value="">Select...</option>
                        <option value="1-5">1-5 employees</option>
                        <option value="6-15">6-15 employees</option>
                        <option value="16-50">16-50 employees</option>
                        <option value="50+">50+ employees</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      <User className="inline mr-2" size={16} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="CEO / Property Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      <Mail className="inline mr-2" size={16} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      <Phone className="inline mr-2" size={16} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Create Account */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-[#F6F7F9] rounded-xl p-4 mb-6">
                    <p className="text-sm text-[#6B7280]">
                      Create an account to manage your listing. You'll use this to log in to your dashboard.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      <Lock className="inline mr-2" size={16} />
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 pr-12 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B0F17]"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">At least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      How did you hear about us?
                    </label>
                    <select
                      name="howDidYouHear"
                      value={formData.howDidYouHear}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    >
                      <option value="">Select...</option>
                      <option value="search">Google Search</option>
                      <option value="social">Social Media</option>
                      <option value="referral">Referral</option>
                      <option value="event">Industry Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Additional Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none resize-none"
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-4 px-6 rounded-xl border-2 border-[#0B0F17]/10 font-semibold hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-gold py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Submitting...
                    </span>
                  ) : step === 3 ? (
                    'Submit Claim'
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help */}
          <p className="text-center text-sm text-[#6B7280] mt-6">
            Need help? Contact us at{' '}
            <a href="mailto:support@bnbinsights.ae" className="text-[#D4A23F] hover:underline">
              support@bnbinsights.ae
            </a>
          </p>
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
}
