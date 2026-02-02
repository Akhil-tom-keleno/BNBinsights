import Navigation from '@/sections/Navigation';
import HeroSection from '@/sections/HeroSection';
import FeaturedManagers from '@/sections/FeaturedManagers';
import BrowseMarkets from '@/sections/BrowseMarkets';
import GetStartedCTA from '@/sections/GetStartedCTA';
import ForManagers from '@/sections/ForManagers';
import HowItWorks from '@/sections/HowItWorks';
import ClosingFooter from '@/sections/ClosingFooter';

export default function Home() {
  return (
    <div className="relative">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main content */}
      <main>
        <HeroSection />
        <FeaturedManagers />
        <BrowseMarkets />
        <GetStartedCTA />
        <ForManagers />
        <HowItWorks />
        <ClosingFooter />
      </main>
    </div>
  );
}
