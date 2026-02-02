import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Building2 } from 'lucide-react';
import type { Manager } from '@/types';

export default function FeaturedManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/managers?featured=true`);
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      }
    } catch (error) {
      console.error('Failed to load managers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      id="featured"
      className="min-h-screen bg-[#F6F7F9] flex flex-col justify-center py-20"
    >
      {/* Header */}
      <div className="w-full px-6 lg:px-[6vw]">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-12">
          <div>
            <h2 
              className="font-['Space_Grotesk'] font-bold text-[#0B0F17] leading-[0.95]"
              style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}
            >
              Featured managers<br />
              <span className="text-[#6B7280]">across Dubai</span>
            </h2>
          </div>

          <div className="lg:max-w-[36vw] lg:pt-2">
            <p className="text-[#6B7280] text-base lg:text-lg leading-relaxed">
              We verify company details, collect real performance signals, and surface the best partners for your property.
            </p>
            <Link 
              to="/managers" 
              className="inline-flex items-center gap-2 mt-4 text-[#0B0F17] font-semibold link-underline"
            >
              View all managers
              <ArrowRight size={18} className="text-[#D4A23F]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="mt-10 lg:mt-16">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A23F]"></div>
          </div>
        ) : managers.length === 0 ? (
          <div className="text-center py-12 text-[#6B7280]">
            No featured managers found
          </div>
        ) : (
          <div 
            className="flex gap-4 lg:gap-[2.2vw] px-6 lg:pl-[6vw] overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {managers.map((manager) => (
              <Link
                key={manager.id}
                to={`/manager/${manager.slug}`}
                className="flex-shrink-0 w-[280px] lg:w-[30vw] h-[400px] lg:h-[52vh] relative rounded-[28px] overflow-hidden card-shadow group cursor-pointer block"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] to-[#0B0F17]">
                  {manager.cover_image_url && (
                    <img 
                      src={manager.cover_image_url}
                      alt={manager.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/95 via-[#0B0F17]/50 to-transparent" />
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#D4A23F] text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                  <h3 className="text-white font-['Space_Grotesk'] font-bold text-lg lg:text-xl mb-2">
                    {manager.name}
                  </h3>
                  
                  {/* Listings Count */}
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                    <Building2 size={14} />
                    <span>{(manager as any).listings_count || 100}+ properties managed</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < Math.floor(manager.rating) ? 'text-[#D4A23F] fill-[#D4A23F]' : 'text-white/30'}
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold text-sm">{manager.rating}</span>
                    <span className="text-white/60 text-sm">({manager.review_count} reviews)</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
