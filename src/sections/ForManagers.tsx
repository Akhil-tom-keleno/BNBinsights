import { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Users, Eye, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: Search, label: 'Search markets' },
  { icon: Users, label: 'Compare managers' },
  { icon: Eye, label: 'View profile' },
  { icon: MessageCircle, label: 'Contact manager' }
];

export default function ForManagers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // Entrance (0% - 30%)
      scrollTl
        .fromTo(imageRef.current,
          { x: '-55vw', scale: 0.98, opacity: 0 },
          { x: 0, scale: 1, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(headlineRef.current,
          { x: '18vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.06
        )
        .fromTo(bodyRef.current,
          { x: '14vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.10
        )
        .fromTo(ctaRef.current,
          { y: '10vh', scale: 0.96, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0.14
        );

      // Steps stagger
      const stepChips = stepsRef.current?.children;
      if (stepChips) {
        Array.from(stepChips).forEach((chip, index) => {
          scrollTl.fromTo(chip,
            { y: '6vh', opacity: 0 },
            { y: 0, opacity: 1, ease: 'none' },
            0.18 + index * 0.04
          );
        });
      }

      // Exit (70% - 100%)
      scrollTl
        .fromTo(imageRef.current,
          { x: 0, opacity: 1 },
          { x: '-10vw', opacity: 0, ease: 'power2.in' },
          0.70
        )
        .fromTo([headlineRef.current, bodyRef.current, ctaRef.current],
          { x: 0, opacity: 1 },
          { x: '10vw', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.70
        );

      if (stepChips) {
        Array.from(stepChips).forEach((chip, index) => {
          scrollTl.fromTo(chip,
            { opacity: 1 },
            { opacity: 0, ease: 'power2.in' },
            0.74 + index * 0.02
          );
        });
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="list-company"
      className="section-pinned bg-[#F6F7F9] flex items-center"
    >
      <div className="w-full px-6 lg:px-[6vw] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Image */}
        <div 
          ref={imageRef}
          className="flex-1 w-full max-w-[500px] lg:w-[40vw] h-[400px] lg:h-[72vh] rounded-[28px] overflow-hidden card-shadow-lg"
        >
          <img 
            src="/b2b_manager_laptop.jpg"
            alt="Property manager working"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 max-w-[40vw]">
          <h2 
            ref={headlineRef}
            className="font-['Space_Grotesk'] font-bold text-[#0B0F17] leading-[0.95]"
            style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
          >
            Are you a property manager?
          </h2>
          
          <p 
            ref={bodyRef}
            className="text-[#6B7280] mt-6 lg:mt-8 leading-relaxed"
            style={{ fontSize: 'clamp(15px, 1.5vw, 18px)' }}
          >
            List your company to get discovered by owners looking for trusted managers in Dubai. Update your profile, add your service areas, and receive inquiries directly.
          </p>
          
          <Link 
            to="/list-company"
            ref={ctaRef}
            className="inline-block btn-gold mt-8 lg:mt-10 px-8 py-4 rounded-2xl font-semibold text-base"
          >
            List your company
          </Link>

          {/* Steps */}
          <div 
            ref={stepsRef}
            className="flex flex-wrap gap-3 mt-8"
          >
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0B0F17]/12 bg-white/50"
              >
                <span className="text-[#D4A23F] font-semibold text-sm">{index + 1})</span>
                <step.icon size={16} className="text-[#6B7280]" />
                <span className="text-[#0B0F17] text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
