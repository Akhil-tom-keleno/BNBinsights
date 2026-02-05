import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Save, X, Building2, Users, Globe, Award } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import ClosingFooter from '@/sections/ClosingFooter';
import { useAuth } from '@/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface AboutContent {
  id: number;
  title: string;
  subtitle: string;
  mission: string;
  story: string;
  values: string;
  stats: {
    managers: number;
    properties: number;
    cities: number;
    satisfaction: number;
  };
  updated_at: string;
}

export default function About() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [content, setContent] = useState<AboutContent>({
    id: 1,
    title: 'About BNBinsights',
    subtitle: 'The leading directory for Dubai vacation rental managers',
    mission: 'Our mission is to empower property owners with transparent, data-driven insights to make informed decisions about their vacation rental management. We believe that access to high-quality information leads to better partnerships and greater success.',
    story: 'BNBinsights was founded in 2024 with a simple vision: create a comprehensive, unbiased directory of Dubai\'s vacation rental management companies. What started as a small project has grown into the region\'s most trusted resource for property owners seeking professional management services.\n\nWe\'ve analyzed hundreds of management companies, collected thousands of reviews, and built a platform that brings transparency to an industry that desperately needed it. Our team of experts continuously monitors the market to ensure our data remains accurate and up-to-date.',
    values: '• Transparency: We provide unbiased, data-driven information\n• Quality: We carefully vet and verify all listed companies\n• Innovation: We constantly improve our platform and methodology\n• Community: We build connections between owners and managers\n• Excellence: We strive for the highest standards in everything we do',
    stats: {
      managers: 190,
      properties: 25000,
      cities: 1,
      satisfaction: 98
    },
    updated_at: new Date().toISOString()
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<AboutContent>(content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await fetch(`${API_URL}/content/about`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
        setEditedContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch about content:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/content/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editedContent)
      });
      
      if (response.ok) {
        setContent(editedContent);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save about content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
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
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedContent.title}
                  onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                  className="w-full text-4xl md:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] text-[#0B0F17] text-center bg-transparent border-b-2 border-[#D4A23F] focus:outline-none mb-4"
                />
                <input
                  type="text"
                  value={editedContent.subtitle}
                  onChange={(e) => setEditedContent({ ...editedContent, subtitle: e.target.value })}
                  className="w-full text-lg md:text-xl text-[#6B7280] text-center bg-transparent border-b border-[#0B0F17]/20 focus:outline-none focus:border-[#D4A23F]"
                />
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] text-[#0B0F17] mb-4">
                  {content.title}
                </h1>
                <p className="text-lg md:text-xl text-[#6B7280]">
                  {content.subtitle}
                </p>
              </>
            )}
            
            {/* Admin Edit Button */}
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#0B0F17] text-white rounded-lg hover:bg-[#1a1f2e] transition-colors"
              >
                <Edit2 size={18} />
                Edit Page
              </button>
            )}
            
            {/* Edit Actions */}
            {isEditing && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A23F] text-white rounded-lg hover:bg-[#b88d35] transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#0B0F17]/20 rounded-lg hover:bg-[#0B0F17]/5 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full px-6 lg:px-[6vw] mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center card-shadow">
                <Building2 className="mx-auto mb-3 text-[#D4A23F]" size={32} />
                <p className="text-3xl md:text-4xl font-bold text-[#0B0F17]">{content.stats.managers}+</p>
                <p className="text-[#6B7280]">Property Managers</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center card-shadow">
                <Globe className="mx-auto mb-3 text-[#D4A23F]" size={32} />
                <p className="text-3xl md:text-4xl font-bold text-[#0B0F17]">{content.stats.properties.toLocaleString()}+</p>
                <p className="text-[#6B7280]">Properties Managed</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center card-shadow">
                <Users className="mx-auto mb-3 text-[#D4A23F]" size={32} />
                <p className="text-3xl md:text-4xl font-bold text-[#0B0F17]">{content.stats.cities}</p>
                <p className="text-[#6B7280]">City Focused</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center card-shadow">
                <Award className="mx-auto mb-3 text-[#D4A23F]" size={32} />
                <p className="text-3xl md:text-4xl font-bold text-[#0B0F17]">{content.stats.satisfaction}%</p>
                <p className="text-[#6B7280]">User Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="w-full px-6 lg:px-[6vw]">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 card-shadow">
              <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">Our Mission</h2>
              {isEditing ? (
                <textarea
                  value={editedContent.mission}
                  onChange={(e) => setEditedContent({ ...editedContent, mission: e.target.value })}
                  className="w-full h-32 p-4 border border-[#0B0F17]/20 rounded-xl focus:outline-none focus:border-[#D4A23F] resize-none"
                />
              ) : (
                <p className="text-[#6B7280] leading-relaxed">{content.mission}</p>
              )}
            </div>

            {/* Story */}
            <div className="bg-white rounded-2xl p-8 card-shadow">
              <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">Our Story</h2>
              {isEditing ? (
                <textarea
                  value={editedContent.story}
                  onChange={(e) => setEditedContent({ ...editedContent, story: e.target.value })}
                  className="w-full h-48 p-4 border border-[#0B0F17]/20 rounded-xl focus:outline-none focus:border-[#D4A23F] resize-none"
                />
              ) : (
                <div className="text-[#6B7280] leading-relaxed whitespace-pre-line">
                  {content.story}
                </div>
              )}
            </div>

            {/* Values */}
            <div className="bg-white rounded-2xl p-8 card-shadow">
              <h2 className="text-2xl font-bold text-[#0B0F17] mb-4">Our Values</h2>
              {isEditing ? (
                <textarea
                  value={editedContent.values}
                  onChange={(e) => setEditedContent({ ...editedContent, values: e.target.value })}
                  className="w-full h-48 p-4 border border-[#0B0F17]/20 rounded-xl focus:outline-none focus:border-[#D4A23F] resize-none"
                />
              ) : (
                <div className="text-[#6B7280] leading-relaxed whitespace-pre-line">
                  {content.values}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#0B0F17] to-[#1a1f2e] rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Find Your Perfect Manager?</h2>
              <p className="text-white/70 mb-6">
                Browse our comprehensive directory of Dubai's top vacation rental management companies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/managers" className="btn-gold px-8 py-3 rounded-xl font-medium">
                  Browse Managers
                </Link>
                <Link to="/contact" className="px-8 py-3 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ClosingFooter />
    </div>
  );
}
