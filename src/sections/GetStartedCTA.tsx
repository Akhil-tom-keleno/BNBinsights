import { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function GetStartedCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        }
      });

      // Entrance (0% - 30%)
      scrollTl
        .fromTo(headlineRef.current,
          { x: '-22vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(bodyRef.current,
          { x: '-14vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.08
        )
        .fromTo(ctaRef.current,
          { y: '10vh', scale: 0.96, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0.14
        )
        .fromTo(imageRef.current,
          { x: '55vw', scale: 0.98, opacity: 0 },
          { x: 0, scale: 1, opacity: 1, ease: 'none' },
          0.06
        )
        .fromTo(linkRef.current,
          { y: '4vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.18
        );

      // Exit (70% - 100%)
      scrollTl
        .fromTo([headlineRef.current, bodyRef.current, ctaRef.current],
          { x: 0, opacity: 1 },
          { x: '-10vw', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.70
        )
        .fromTo(imageRef.current,
          { x: 0, opacity: 1 },
          { x: '10vw', opacity: 0, ease: 'power2.in' },
          0.70
        )
        .fromTo(linkRef.current,
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.75
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned bg-[#F6F7F9] flex items-center"
    >
      <div className="w-full px-6 lg:px-[6vw] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-[44vw]">
          <h2 
            ref={headlineRef}
            className="font-['Space_Grotesk'] font-bold text-[#0B0F17] leading-[0.95]"
            style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
          >
            Find your next property manager today
          </h2>
          
          <p 
            ref={bodyRef}
            className="text-[#6B7280] mt-6 lg:mt-8 leading-relaxed max-w-[38vw]"
            style={{ fontSize: 'clamp(15px, 1.5vw, 18px)' }}
          >
            Thousands of owners use BNBinsights to hire professional managers. Browse top-rated company profiles, compare fees, and contact managers in minutes.
          </p>
          
          <Link 
            to="/get-started"
            ref={ctaRef}
            className="inline-block btn-gold mt-8 lg:mt-10 px-8 py-4 rounded-2xl font-semibold text-base"
          >
            Get started now
          </Link>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex flex-col items-center">
          <div 
            ref={imageRef}
            className="w-full max-w-[500px] lg:w-[40vw] h-[400px] lg:h-[72vh] rounded-[28px] overflow-hidden card-shadow-lg"
          >
            <img 
              src="/cta_host_tablet.jpg"
              alt="Property owner using tablet"
              className="w-full h-full object-cover"
            />
          </div>
          
          <Link 
            to="/blog"
            ref={linkRef}
            className="inline-flex items-center gap-2 mt-6 text-[#0B0F17] font-semibold link-underline"
          >
            View resources
            <ArrowRight size={18} className="text-[#D4A23F]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
