import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Star, MapPin, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Location {
  id: number;
  name: string;
  slug: string;
  description: string;
  properties_count: number;
  avg_daily_rate: number;
  occupancy_rate: number;
  is_featured: number;
}

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        <button className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2">
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
          <div key={location.id} className="bg-white rounded-2xl p-6 card-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="text-blue-600" size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggleFeatured(location)}
                  className={`p-2 rounded-lg transition-colors ${
                    location.is_featured 
                      ? 'bg-amber-100 text-amber-600' 
                      : 'hover:bg-[#F6F7F9] text-[#6B7280]'
                  }`}
                >
                  <Star size={18} fill={location.is_featured ? 'currentColor' : 'none'} />
                </button>
                <button className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600">
                  <Edit2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-[#0B0F17] text-lg mb-1">{location.name}</h3>
            <p className="text-sm text-[#6B7280] mb-4">/{location.slug}</p>

            <div className="grid grid-cols-3 gap-4 text-center">
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
              className="mt-4 flex items-center justify-center gap-2 text-[#D4A23F] hover:underline text-sm"
            >
              <Eye size={16} />
              View on Site
            </a>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-[#6B7280]">No locations found</p>
        </div>
      )}
    </div>
  );
}
