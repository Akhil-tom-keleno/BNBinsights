import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Star, MapPin, Eye, X, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Location {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  properties_count: number;
  avg_daily_rate: number;
  occupancy_rate: number;
  is_featured: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

interface LocationFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  properties_count: number;
  avg_daily_rate: number;
  occupancy_rate: number;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const initialFormData: LocationFormData = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  properties_count: 0,
  avg_daily_rate: 0,
  occupancy_rate: 0,
  is_featured: false,
  seo_title: '',
  seo_description: '',
  seo_keywords: ''
};

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setIsLoading(false);
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
      slug: editingLocation ? prev.slug : generateSlug(name)
    }));
  };

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      slug: location.slug,
      description: location.description || '',
      image_url: location.image_url || '',
      properties_count: location.properties_count || 0,
      avg_daily_rate: location.avg_daily_rate || 0,
      occupancy_rate: location.occupancy_rate || 0,
      is_featured: location.is_featured === 1,
      seo_title: location.seo_title || '',
      seo_description: location.seo_description || '',
      seo_keywords: location.seo_keywords || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingLocation 
        ? `${API_URL}/locations/${editingLocation.id}`
        : `${API_URL}/locations`;
      
      const method = editingLocation ? 'PUT' : 'POST';
      
      const body = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image_url: formData.image_url,
        properties_count: formData.properties_count || 0,
        avg_daily_rate: formData.avg_daily_rate || 0,
        occupancy_rate: formData.occupancy_rate || 0,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        seo_keywords: formData.seo_keywords
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
        fetchLocations();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save location');
      }
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchLocations();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const handleToggleFeatured = async (location: Location) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/locations/${location.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !location.is_featured })
      });
      fetchLocations();
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold text-[#0B0F17]">Locations</h2>
          <p className="text-[#6B7280]">Manage Dubai areas and neighborhoods</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 card-shadow">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => (
          <div key={location.id} className="bg-white rounded-2xl overflow-hidden card-shadow">
            {/* Cover Image */}
            <div className="h-40 bg-[#F6F7F9] overflow-hidden">
              {location.image_url ? (
                <img
                  src={location.image_url}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                  <MapPin size={48} />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#0B0F17] text-lg">{location.name}</h3>
                  <p className="text-sm text-[#6B7280]">/{location.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleToggleFeatured(location)}
                    className={`p-2 rounded-lg transition-colors ${
                      location.is_featured === 1
                        ? 'bg-amber-100 text-amber-600' 
                        : 'hover:bg-[#F6F7F9] text-[#6B7280]'
                    }`}
                  >
                    <Star size={18} fill={location.is_featured === 1 ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={() => openEditModal(location)}
                    className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(location.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-[#F6F7F9] rounded-lg p-3">
                  <p className="font-semibold text-[#0B0F17]">{location.properties_count?.toLocaleString() || 0}</p>
                  <p className="text-xs text-[#6B7280]">Properties</p>
                </div>
                <div className="bg-[#F6F7F9] rounded-lg p-3">
                  <p className="font-semibold text-[#0B0F17]">AED {location.avg_daily_rate || 0}</p>
                  <p className="text-xs text-[#6B7280]">Avg Rate</p>
                </div>
                <div className="bg-[#F6F7F9] rounded-lg p-3">
                  <p className="font-semibold text-[#0B0F17]">{location.occupancy_rate || 0}%</p>
                  <p className="text-xs text-[#6B7280]">Occupancy</p>
                </div>
              </div>

              <a 
                href={`/location/${location.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[#D4A23F] hover:underline text-sm"
              >
                <Eye size={16} />
                View on Site
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-[#6B7280]">No locations found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#0B0F17]">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#0B0F17] border-b border-[#0B0F17]/10 pb-2">Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="e.g., Palm Jumeirah"
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
                      placeholder="palm-jumeirah"
                      required
                    />
                    <p className="text-xs text-[#6B7280] mt-1">URL: /location/{formData.slug}</p>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none h-20"
                      placeholder="Brief description of this location"
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="/location-image.jpg"
                    />
                  </div>

                  {/* Featured */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                        className="w-5 h-5 rounded border-[#0B0F17]/20 text-[#D4A23F] focus:ring-[#D4A23F]"
                      />
                      <span className="text-sm font-medium text-[#0B0F17]">Featured on homepage</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#0B0F17] border-b border-[#0B0F17]/10 pb-2">Market Metrics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Properties Count */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Properties Count
                    </label>
                    <input
                      type="number"
                      value={formData.properties_count || ''}
                      onChange={(e) => setFormData({...formData, properties_count: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="10000"
                    />
                  </div>

                  {/* Average Daily Rate */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Avg Daily Rate (AED)
                    </label>
                    <input
                      type="number"
                      value={formData.avg_daily_rate || ''}
                      onChange={(e) => setFormData({...formData, avg_daily_rate: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="1200"
                    />
                  </div>

                  {/* Occupancy Rate */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      Occupancy Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.occupancy_rate || ''}
                      onChange={(e) => setFormData({...formData, occupancy_rate: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="65"
                    />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h4 className="font-semibold text-[#0B0F17] border-b border-[#0B0F17]/10 pb-2">SEO Settings</h4>
                
                <div className="space-y-4">
                  {/* SEO Title */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="Property Managers in {Location} | BNBinsights"
                    />
                  </div>

                  {/* SEO Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none h-20"
                      placeholder="Meta description for search engines"
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.seo_keywords}
                      onChange={(e) => setFormData({...formData, seo_keywords: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                      placeholder="holiday homes, property management, dubai vacation rentals"
                    />
                  </div>
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
                  {isSubmitting ? 'Saving...' : (editingLocation ? 'Update Location' : 'Create Location')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
