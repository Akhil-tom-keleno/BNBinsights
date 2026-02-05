import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Building2, Clock } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import ClosingFooter from '@/sections/ClosingFooter';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="relative min-h-screen bg-[#F6F7F9]">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="w-full px-6 lg:px-[6vw] mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] text-[#0B0F17] mb-4">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-[#6B7280]">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="w-full px-6 lg:px-[6vw] mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center card-shadow">
                <div className="w-14 h-14 bg-[#D4A23F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-[#D4A23F]" size={28} />
                </div>
                <h3 className="font-semibold text-[#0B0F17] mb-2">Email Us</h3>
                <a 
                  href="mailto:support@bnbinsights.ae"
                  className="text-[#6B7280] hover:text-[#D4A23F] transition-colors"
                >
                  support@bnbinsights.ae
                </a>
              </div>
              
              <div className="bg-white rounded-2xl p-6 text-center card-shadow">
                <div className="w-14 h-14 bg-[#D4A23F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-[#D4A23F]" size={28} />
                </div>
                <h3 className="font-semibold text-[#0B0F17] mb-2">Call Us</h3>
                <a 
                  href="tel:+971501234567"
                  className="text-[#6B7280] hover:text-[#D4A23F] transition-colors"
                >
                  +971 50 123 4567
                </a>
              </div>
              
              <div className="bg-white rounded-2xl p-6 text-center card-shadow">
                <div className="w-14 h-14 bg-[#D4A23F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-[#D4A23F]" size={28} />
                </div>
                <h3 className="font-semibold text-[#0B0F17] mb-2">Visit Us</h3>
                <p className="text-[#6B7280]">
                  Dubai, UAE
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="w-full px-6 lg:px-[6vw]">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-8 card-shadow">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} />
                      </div>
                      <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">Message Sent!</h2>
                      <p className="text-[#6B7280] mb-6">
                        Thank you for reaching out. We'll get back to you within 24-48 hours.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="btn-gold px-6 py-3 rounded-xl font-medium"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-[#0B0F17] mb-6">Send us a Message</h2>
                      
                      {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                          {error}
                        </div>
                      )}
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F] transition-colors"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F] transition-colors"
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                            Inquiry Type *
                          </label>
                          <select
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F] transition-colors bg-white"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="listing">List My Company</option>
                            <option value="support">Support</option>
                            <option value="partnership">Partnership</option>
                            <option value="feedback">Feedback</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                            Subject *
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F] transition-colors"
                            placeholder="How can we help?"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                            Message *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-4 py-3 border border-[#0B0F17]/10 rounded-xl focus:outline-none focus:border-[#D4A23F] transition-colors resize-none"
                            placeholder="Tell us more about your inquiry..."
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full btn-gold py-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={20} />
                              Send Message
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
              
              {/* Sidebar Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold text-[#0B0F17] mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-[#D4A23F]" />
                    Response Time
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    We typically respond to all inquiries within 24-48 hours during business days. For urgent matters, please call us directly.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold text-[#0B0F17] mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-[#D4A23F]" />
                    For Property Managers
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                    Want to list your company on BNBinsights? Get started by claiming your listing.
                  </p>
                  <Link 
                    to="/list-company"
                    className="text-[#D4A23F] font-medium hover:underline text-sm"
                  >
                    List Your Company →
                  </Link>
                </div>
                
                <div className="bg-white rounded-2xl p-6 card-shadow">
                  <h3 className="font-semibold text-[#0B0F17] mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-[#D4A23F]" />
                    FAQ
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                    Find answers to common questions in our help center.
                  </p>
                  <Link 
                    to="/blog"
                    className="text-[#D4A23F] font-medium hover:underline text-sm"
                  >
                    Visit Blog →
                  </Link>
                </div>
                
                <div className="bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e] rounded-2xl p-6 text-white">
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Sunday - Thursday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday - Saturday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-4">
                    GST (Gulf Standard Time)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ClosingFooter />
    </div>
  );
}
