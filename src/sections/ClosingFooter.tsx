import { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  browse: [
    { label: 'Markets', href: '/locations' },
    { label: 'Managers', href: '/managers' },
    { label: 'Locations', href: '/locations' },
  ],
  company: [
    { label: 'About', href: '/blog' },
    { label: 'Careers', href: '/blog' },
    { label: 'Contact', href: '/list-company' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
  ],
};

export default function ClosingFooter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(headlineRef.current,
        { y: '8vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(sublineRef.current,
        { y: '6vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sublineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(ctaRef.current,
        { scale: 0.96, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(footerRef.current,
        { y: '6vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="bg-[#F6F7F9] pt-20 lg:pt-32"
    >
      {/* Closing CTA */}
      <div className="w-full px-6 lg:px-[6vw] text-center pb-20 lg:pb-32">
        <h2 
          ref={headlineRef}
          className="font-['Space_Grotesk'] font-bold text-[#0B0F17] leading-[0.95] mx-auto"
          style={{ fontSize: 'clamp(32px, 4vw, 56px)', maxWidth: '72vw' }}
        >
          Use high-quality information to choose your next property manager.
        </h2>
        
        <p 
          ref={sublineRef}
          className="text-[#6B7280] mt-6 lg:mt-8 mx-auto"
          style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', maxWidth: '48vw' }}
        >
          Join thousands of owners who trust BNBinsights to manage smarter.
        </p>
        
        <Link 
          to="/get-started"
          ref={ctaRef}
          className="inline-block btn-gold mt-8 lg:mt-10 px-8 py-4 rounded-2xl font-semibold text-base"
        >
          Get started now
        </Link>
      </div>

      {/* Footer */}
      <footer 
        ref={footerRef}
        className="border-t border-[#0B0F17]/8 bg-[#F6F7F9]"
      >
        <div className="w-full px-6 lg:px-[6vw] py-12 lg:py-16">
          {/* Top Row */}
          <div className="flex flex-col lg:flex-row lg:justify-between gap-10 lg:gap-16">
            {/* Logo & Tagline */}
            <div className="lg:max-w-[280px]">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold font-['Space_Grotesk'] text-[#0B0F17]">
                  BNBinsights
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#D4A23F] text-[#0B0F17]">
                  Dubai
                </span>
              </Link>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                The world's largest directory of Dubai vacation rental managers. Find, compare, and connect with trusted property managers.
              </p>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Browse */}
              <div>
                <h4 className="font-semibold text-[#0B0F17] mb-4">Browse</h4>
                <ul className="space-y-3">
                  {footerLinks.browse.map((link) => (
                    <li key={link.label}>
                      <Link 
                        to={link.href}
                        className="text-[#6B7280] text-sm hover:text-[#0B0F17] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-semibold text-[#0B0F17] mb-4">Company</h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link 
                        to={link.href}
                        className="text-[#6B7280] text-sm hover:text-[#0B0F17] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold text-[#0B0F17] mb-4">Resources</h4>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.label}>
                      <Link 
                        to={link.href}
                        className="text-[#6B7280] text-sm hover:text-[#0B0F17] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="mt-12 lg:mt-16 pt-8 border-t border-[#0B0F17]/8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#6B7280] text-sm">
              © 2026 BNBinsights. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-[#6B7280] text-sm hover:text-[#0B0F17] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-[#6B7280] text-sm hover:text-[#0B0F17] transition-colors">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
