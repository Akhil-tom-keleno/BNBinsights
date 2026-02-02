import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, Calendar } from 'lucide-react';
import type { Location } from '@/types';

export default function BrowseMarkets() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/locations?featured=true`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      id="markets"
      className="min-h-screen bg-[#0B0F17] flex flex-col justify-center py-20"
    >
      {/* Header */}
      <div className="w-full px-6 lg:px-[6vw]">
        <h2 
          className="font-['Space_Grotesk'] font-bold text-[#F6F7F9] text-center uppercase tracking-wide"
          style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}
        >
          Browse our markets
        </h2>
        <p 
          className="text-[#A7B1C2] text-center mt-4 lg:mt-6 max-w-[56vw] mx-auto"
          style={{ fontSize: 'clamp(14px, 1.5vw, 18px)' }}
        >
          Explore occupancy, average daily rates, and property counts across Dubai's top short-term rental areas.
        </p>
      </div>

      {/* Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-[3vw] px-6 lg:px-[6vw] mt-8 lg:mt-12">
        {isLoading ? (
          <div className="col-span-3 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A23F] mx-auto"></div>
          </div>
        ) : locations.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-[#A7B1C2]">
            No locations found
          </div>
        ) : (
          locations.map((location) => (
            <Link
              key={location.id}
              to={`/location/${location.slug}`}
              className="relative h-[200px] lg:h-[26vh] rounded-[18px] overflow-hidden group cursor-pointer block"
            >
              {/* Background Image */}
              <img 
                src={location.image_url || '/market_palm_aerial.jpg'}
                alt={location.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/90 via-[#0B0F17]/50 to-[#0B0F17]/20" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                <h3 className="text-white font-['Space_Grotesk'] font-bold text-lg lg:text-xl mb-3">
                  {location.name}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-[#D4A23F]" />
                    <span className="text-white/80 text-xs lg:text-sm font-mono">{location.properties_count?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#D4A23F]" />
                    <span className="text-white/80 text-xs lg:text-sm font-mono">AED {location.avg_daily_rate || '0'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#D4A23F]" />
                    <span className="text-white/80 text-xs lg:text-sm font-mono">{location.occupancy_rate || '0'}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Browse All Link */}
      <div className="flex justify-end px-6 lg:px-[6vw] mt-6">
        <Link 
          to="/locations" 
          className="inline-flex items-center gap-2 text-[#F6F7F9] font-semibold text-sm hover:text-[#D4A23F] transition-colors"
        >
          Browse all markets
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
