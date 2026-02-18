import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Star, CheckCircle, XCircle, Building2, X, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Manager {
  id: number;
  name: string;
  slug: string;
  description: string;
  location_id: number;
  location_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  founded_year: number;
  listings_count: number;
  rating: number;
  review_count: number;
  is_featured: number;
  is_active: number;
  is_claimed: number;
  is_verified: number;
  cover_image_url: string;
  services: string[];
  social_links: {
    website?: string;
    airbnb?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface Location {
  id: number;
  name: string;
}

interface ManagerFormData {
  name: string;
  slug: string;
  description: string;
  location_id: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  founded_year: number;
  listings_count: number;
  cover_image_url: string;
  services: string;
  instagram: string;
  linkedin: string;
  airbnb: string;
}

const initialFormData: ManagerFormData = {
  name: '',
  slug: '',
  description: '',
  location_id: 0,
  address: '',
  phone: '',
  email: '',
  website: '',
  founded_year: 0,
  listings_count: 0,
  cover_image_url: '',
  services: '',
  instagram: '',
  linkedin: '',
  airbnb: ''
};

export default function AdminManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState<ManagerFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchManagers();
    fetchLocations();
  }, []);

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingManager ? prev.slug : generateSlug(name)
    }));
  };

  const openCreateModal = () => {
    setEditingManager(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      slug: manager.slug,
      description: manager.description || '',
      location_id: manager.location_id || 0,
      address: manager.address || '',
      phone: manager.phone || '',
      email: manager.email || '',
      website: manager.website || '',
      founded_year: manager.founded_year || 0,
      listings_count: manager.listings_count || 0,
      cover_image_url: manager.cover_image_url || '',
      services: manager.services ? manager.services.join(', ') : '',
      instagram: manager.social_links?.instagram || '',
      linkedin: manager.social_links?.linkedin || '',
      airbnb: manager.social_links?.airbnb || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingManager(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingManager 
        ? `${API_URL}/managers/${editingManager.id}`
        : `${API_URL}/managers`;
      
      const method = editingManager ? 'PUT' : 'POST';
      
      const body: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        location_id: formData.location_id || null,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        founded_year: formData.founded_year || null,
        listings_count: formData.listings_count || 0,
        cover_image_url: formData.cover_image_url,
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
        social_links: {
          website: formData.website,
          airbnb: formData.airbnb,
          instagram: formData.instagram,
          linkedin: formData.linkedin
        }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        closeModal();
        fetchManagers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save manager');
      }
    } catch (error) {
      console.error('Failed to save manager:', error);
      alert('Failed to save manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this manager?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/managers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to delete manager:', error);
    }
  };

  const handleToggleFeatured = async (manager: Manager) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/managers/${manager.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !manager.is_featured })
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to update manager:', error);
    }
  };

  const handleToggleVerified = async (manager: Manager) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/managers/${manager.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_verified: !manager.is_verified })
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to update manager:', error);
    }
  };

  const handleApproveManager = async (manager: Manager) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/managers/${manager.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: 1 })
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to approve manager:', error);
    }
  };

  const filteredManagers = managers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'pending') return matchesSearch && m.is_active === 0;
    if (activeTab === 'verified') return matchesSearch && m.is_verified === 1;
    return matchesSearch;
  });

  const pendingCount = managers.filter(m => m.is_active === 0).length;
  const verifiedCount = managers.filter(m => m.is_verified === 1).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#D4A23F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B0F17]">Property Managers</h2>
          <p className="text-[#6B7280]">Manage your property manager listings</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Manager
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#0B0F17]/10">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'all' 
              ? 'border-[#D4A23F] text-[#D4A23F]' 
              : 'border-transparent text-[#6B7280] hover:text-[#0B0F17]'
          }`}
        >
          All ({managers.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'pending' 
              ? 'border-[#D4A23F] text-[#D4A23F]' 
              : 'border-transparent text-[#6B7280] hover:text-[#0B0F17]'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'verified' 
              ? 'border-[#D4A23F] text-[#D4A23F]' 
              : 'border-transparent text-[#6B7280] hover:text-[#0B0F17]'
          }`}
        >
          Verified ({verifiedCount})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 card-shadow">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input
            type="text"
            placeholder="Search managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F9]">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Manager</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Location</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Listings</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Rating</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0B0F17]/5">
              {filteredManagers.map((manager) => (
                <tr key={manager.id} className="hover:bg-[#F6F7F9]/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D4A23F]/10 rounded-lg flex items-center justify-center">
                        <span className="font-semibold text-[#D4A23F]">
                          {manager.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F17]">{manager.name}</p>
                        <div className="flex items-center gap-2">
                          {manager.is_featured === 1 && (
                            <span className="text-xs text-[#D4A23F] flex items-center gap-1">
                              <Star size={12} fill="currentColor" />
                              Featured
                            </span>
                          )}
                          {manager.is_verified === 1 && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">{manager.location_name || '-'}</td>
                  <td className="px-6 py-4 text-[#0B0F17]">{manager.listings_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-amber-400" size={16} fill="currentColor" />
                      <span className="font-medium">{manager.rating || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {manager.is_active === 0 ? (
                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                          <XCircle size={14} />
                          Pending
                        </span>
                      ) : manager.is_claimed === 1 ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle size={14} />
                          Claimed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600 text-sm">
                          <Building2 size={14} />
                          Unclaimed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {manager.is_active === 0 && (
                        <button 
                          onClick={() => handleApproveManager(manager)}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleToggleFeatured(manager)}
                        className={`p-2 rounded-lg transition-colors ${
                          manager.is_featured === 1
                            ? 'bg-amber-100 text-amber-600' 
                            : 'hover:bg-[#F6F7F9] text-[#6B7280]'
                        }`}
                        title={manager.is_featured === 1 ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star size={18} fill={manager.is_featured === 1 ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        onClick={() => handleToggleVerified(manager)}
                        className={`p-2 rounded-lg transition-colors ${
                          manager.is_verified === 1
                            ? 'bg-green-100 text-green-600' 
                            : 'hover:bg-[#F6F7F9] text-[#6B7280]'
                        }`}
                        title={manager.is_verified === 1 ? 'Remove verified' : 'Mark as verified'}
                      >
                        <CheckCircle size={18} fill={manager.is_verified === 1 ? 'currentColor' : 'none'} />
                      </button>
                      <a 
                        href={`/manager/${manager.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-[#F6F7F9] rounded-lg text-[#6B7280]"
                      >
                        <Eye size={18} />
                      </a>
                      <button 
                        onClick={() => openEditModal(manager)}
                        className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(manager.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredManagers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No managers found</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#0B0F17]">
                {editingManager ? 'Edit Manager' : 'Add New Manager'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="Company name"
                    required
                  />
                </div>

                {/* Slug */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="company-slug"
                    required
                  />
                  <p className="text-xs text-[#6B7280] mt-1">URL: /manager/{formData.slug}</p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    About
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none h-24"
                    placeholder="Company description"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Location
                  </label>
                  <select
                    value={formData.location_id}
                    onChange={(e) => setFormData({...formData, location_id: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  >
                    <option value={0}>Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Founded Year */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.founded_year || ''}
                    onChange={(e) => setFormData({...formData, founded_year: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="2015"
                  />
                </div>

                {/* Properties Managed */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Properties Managed
                  </label>
                  <input
                    type="number"
                    value={formData.listings_count || ''}
                    onChange={(e) => setFormData({...formData, listings_count: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="50"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="/image.jpg"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="https://company.com"
                  />
                </div>

                {/* Airbnb */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Airbnb Profile
                  </label>
                  <input
                    type="text"
                    value={formData.airbnb}
                    onChange={(e) => setFormData({...formData, airbnb: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="https://airbnb.com/users/..."
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="@company"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="company-name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="+971 4 123 4567"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="contact@company.com"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="Full address"
                  />
                </div>

                {/* Services */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                    Services (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.services}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                    placeholder="Property Marketing, Guest Communication, Cleaning..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-[#0B0F17]/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-gold px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingManager ? 'Update Manager' : 'Create Manager')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
