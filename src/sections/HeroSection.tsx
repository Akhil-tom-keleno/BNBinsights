import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Location } from '@/types';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) {
      navigate(`/location/${selectedLocation}`);
    } else if (searchQuery.trim()) {
      navigate(`/managers?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLocationSelect = (slug: string) => {
    setSelectedLocation(slug);
    setShowLocationDropdown(false);
  };

  const selectedLocationName = locations.find(l => l.slug === selectedLocation)?.name || 'Select Location';

  return (
    <section className="min-h-screen flex items-center justify-center relative">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/hero_living_room.jpg" 
          alt="Dubai luxury living room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17]/25 to-[#0B0F17]/45" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 flex flex-col items-center pt-20">
        <h1 
          className="text-white text-center font-['Space_Grotesk'] font-bold leading-[0.95] tracking-tight"
          style={{ 
            fontSize: 'clamp(32px, 5vw, 72px)',
            maxWidth: 'min(90vw, 980px)'
          }}
        >
          Find the perfect manager for your Dubai vacation rental
        </h1>

        <p 
          className="text-white/82 text-center mt-6 lg:mt-8 leading-relaxed"
          style={{ 
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            maxWidth: 'min(70vw, 640px)'
          }}
        >
          Compare top-rated property managers using real guest reviews, performance metrics, and transparent pricing.
        </p>

        {/* Search Card with Location Dropdown */}
        <div className="mt-10 lg:mt-12 w-full max-w-[700px] bg-[#F6F7F9]/94 backdrop-blur-sm rounded-[28px] card-shadow border border-[#0B0F17]/8 overflow-hidden">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch">
            {/* Location Dropdown */}
            <div className="flex-1 px-6 py-4 md:py-0 md:px-6 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[#0B0F17]/10 relative">
              <MapPin className="text-[#D4A23F] flex-shrink-0" size={22} />
              <div className="flex-1 relative">
                <label className="block text-xs font-semibold text-[#0B0F17]/60 uppercase tracking-wider mb-1">
                  Location
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className={selectedLocation ? 'text-[#0B0F17]' : 'text-[#6B7280]'}>
                    {selectedLocationName}
                  </span>
                  <ChevronDown size={18} className={`text-[#6B7280] transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#0B0F17]/10 max-h-60 overflow-y-auto z-50">
                    <button
                      type="button"
                      onClick={() => { setSelectedLocation(''); setShowLocationDropdown(false); }}
                      className="w-full px-4 py-3 text-left hover:bg-[#F6F7F9] text-[#6B7280]"
                    >
                      All Locations
                    </button>
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleLocationSelect(loc.slug)}
                        className="w-full px-4 py-3 text-left hover:bg-[#F6F7F9] text-[#0B0F17] flex items-center gap-2"
                      >
                        <MapPin size={14} className="text-[#D4A23F]" />
                        {loc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 px-6 py-4 md:py-0 md:px-6 flex items-center gap-4">
              <Search className="text-[#D4A23F] flex-shrink-0" size={22} />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#0B0F17]/60 uppercase tracking-wider mb-1">
                  Search Companies
                </label>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Company name..."
                  className="w-full bg-transparent text-[#0B0F17] placeholder:text-[#6B7280] text-base outline-none"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="p-3">
              <button 
                type="submit"
                className="btn-gold w-full md:w-[132px] h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold"
              >
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 lg:mt-10 text-white/70 text-xs uppercase tracking-[0.18em] font-medium">
          World's largest directory of Dubai vacation rental managers powered by BNBinsights
        </p>
      </div>
    </section>
  );
}
