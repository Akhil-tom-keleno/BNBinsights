import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, ArrowRight, Search } from 'lucide-react';
import type { Manager, Location } from '@/types';
import { useManagers, useLocations } from '@/hooks/useApi';
import Navigation from '@/sections/Navigation';

export default function SERP() {
  const { locationSlug } = useParams<{ locationSlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [managers, setManagers] = useState<Manager[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedLocation, setSelectedLocation] = useState(locationSlug || '');
  
  const { getManagers, isLoading: managersLoading } = useManagers();
  const { getLocations, getLocation } = useLocations();

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (locationSlug) {
      loadLocationData(locationSlug);
    } else {
      loadManagers();
    }
  }, [locationSlug, searchQuery]);

  const loadLocations = async () => {
    const data = await getLocations();
    if (data) setLocations(data as Location[]);
  };

  const loadLocationData = async (slug: string) => {
    const data = await getLocation(slug);
    if (data) {
      const locData = data as Location & { managers?: Manager[] };
      setLocation(locData);
      setManagers(locData.managers || []);
    }
  };

  const loadManagers = async () => {
    const data = await getManagers({ 
      search: searchQuery || undefined,
      location: selectedLocation || undefined 
    });
    if (data) setManagers(data as Manager[]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleLocationChange = (slug: string) => {
    setSelectedLocation(slug);
    if (slug) {
      window.location.href = `/location/${slug}`;
    } else {
      loadManagers();
    }
  };

  const getBreadcrumb = () => {
    if (location) {
      return (
        <nav className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
          <Link to="/" className="hover:text-[#D4A23F]">Home</Link>
          <ArrowRight size={14} />
          <Link to="/locations" className="hover:text-[#D4A23F]">Locations</Link>
          <ArrowRight size={14} />
          <span className="text-[#0B0F17]">{location.name}</span>
        </nav>
      );
    }
    if (searchQuery) {
      return (
        <nav className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
          <Link to="/" className="hover:text-[#D4A23F]">Home</Link>
          <ArrowRight size={14} />
          <span className="text-[#0B0F17]">Search: "{searchQuery}"</span>
        </nav>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#0B0F17] pt-24 pb-12">
        <div className="w-full px-6 lg:px-[6vw]">
          {getBreadcrumb()}
          
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            {location ? `Property Managers in ${location.name}` : 'Property Managers'}
          </h1>
          
          {location && (
            <p className="text-[#A7B1C2] max-w-2xl">
              {location.properties_count.toLocaleString()} properties • AED {location.avg_daily_rate} avg daily rate • {location.occupancy_rate}% occupancy
            </p>
          )}
          
          {searchQuery && (
            <p className="text-[#A7B1C2]">
              {managers.length} results found
            </p>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-[#0B0F17]/8 sticky top-16 z-40">
        <div className="w-full px-6 lg:px-[6vw] py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search managers..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
              />
            </form>
            
            {/* Location Filter */}
            <div className="relative md:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none appearance-none bg-white"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.slug}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="w-full px-6 lg:px-[6vw] py-8">
        {managersLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A23F]"></div>
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#6B7280] text-lg">No managers found</p>
            <p className="text-[#6B7280] mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {managers.map((manager) => (
              <Link
                key={manager.id}
                to={`/manager/${manager.slug}`}
                className="bg-white rounded-2xl p-6 card-shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#F6F7F9]">
                    {manager.cover_image_url ? (
                      <img
                        src={manager.cover_image_url}
                        alt={manager.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                        <MapPin size={32} />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#0B0F17] truncate">
                          {manager.name}
                        </h3>
                        <p className="text-[#6B7280] text-sm flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {manager.location_name}
                        </p>
                      </div>
                      
                      {manager.is_featured && (
                        <span className="px-2 py-1 bg-[#D4A23F]/10 text-[#D4A23F] text-xs font-semibold rounded-full flex-shrink-0">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(manager.rating) ? 'text-[#D4A23F] fill-[#D4A23F]' : 'text-[#E5E7EB]'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-[#0B0F17]">{manager.rating}</span>
                      <span className="text-sm text-[#6B7280]">({manager.review_count} reviews)</span>
                    </div>
                    
                    {/* Services */}
                    {manager.services && manager.services.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {manager.services.slice(0, 3).map((service) => (
                          <span
                            key={service}
                            className="px-2 py-1 bg-[#F6F7F9] text-[#6B7280] text-xs rounded-md"
                          >
                            {service}
                          </span>
                        ))}
                        {manager.services.length > 3 && (
                          <span className="px-2 py-1 bg-[#F6F7F9] text-[#6B7280] text-xs rounded-md">
                            +{manager.services.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Contact */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-[#6B7280]">
                      {manager.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {manager.phone}
                        </span>
                      )}
                      {manager.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {manager.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
