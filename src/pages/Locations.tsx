import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, Calendar, MapPin } from 'lucide-react';
import type { Location } from '@/types';
import { useLocations } from '@/hooks/useApi';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const { getLocations, isLoading } = useLocations();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const data = await getLocations();
    if (data) setLocations(data as Location[]);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#0B0F17] pt-24 pb-12">
        <div className="w-full px-6 lg:px-[6vw]">
          <nav className="flex items-center gap-2 text-sm text-[#A7B1C2] mb-6">
            <Link to="/" className="hover:text-[#D4A23F]">Home</Link>
            <ArrowRight size={14} />
            <span className="text-white">Locations</span>
          </nav>
          
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            Dubai Locations
          </h1>
          <p className="text-[#A7B1C2] max-w-2xl">
            Explore Dubai's top short-term rental markets. Find property managers in your area with verified reviews and performance data.
          </p>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A23F]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Link
                key={location.id}
                to={`/location/${location.slug}`}
                className="group bg-white rounded-2xl overflow-hidden card-shadow hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={location.image_url || '/market_palm_aerial.jpg'}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-2">
                    <MapPin size={16} />
                    <span>Dubai, UAE</span>
                  </div>
                  
                  <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#0B0F17] mb-4 group-hover:text-[#D4A23F] transition-colors">
                    {location.name}
                  </h2>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-[#F6F7F9] rounded-xl">
                      <Building2 className="mx-auto text-[#D4A23F] mb-1" size={20} />
                      <p className="font-bold text-[#0B0F17]">{location.properties_count.toLocaleString()}</p>
                      <p className="text-xs text-[#6B7280]">Properties</p>
                    </div>
                    <div className="text-center p-3 bg-[#F6F7F9] rounded-xl">
                      <TrendingUp className="mx-auto text-[#D4A23F] mb-1" size={20} />
                      <p className="font-bold text-[#0B0F17]">AED {location.avg_daily_rate}</p>
                      <p className="text-xs text-[#6B7280]">Avg Rate</p>
                    </div>
                    <div className="text-center p-3 bg-[#F6F7F9] rounded-xl">
                      <Calendar className="mx-auto text-[#D4A23F] mb-1" size={20} />
                      <p className="font-bold text-[#0B0F17]">{location.occupancy_rate}%</p>
                      <p className="text-xs text-[#6B7280]">Occupancy</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[#0B0F17]/8 flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">View managers</span>
                    <ArrowRight size={18} className="text-[#D4A23F]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <SimpleFooter />
    </div>
  );
}
