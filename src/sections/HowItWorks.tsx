import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, BarChart3, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: Search,
    title: 'Search',
    description: 'Enter your area and property type to see managers with proven track records.',
    color: '#D4A23F'
  },
  {
    icon: BarChart3,
    title: 'Compare',
    description: 'Review ratings, fees, services, and response times side by side.',
    color: '#0B0F17'
  },
  {
    icon: MessageSquare,
    title: 'Connect',
    description: 'Message managers directly and choose the right partner for your property.',
    color: '#D4A23F'
  }
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(headlineRef.current,
        { x: '-10vw', opacity: 0 },
        {
          x: 0,
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

      // Paragraph animation
      gsap.fromTo(paragraphRef.current,
        { x: '10vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: paragraphRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards stagger animation
      const cards = cardsRef.current?.children;
      if (cards) {
        Array.from(cards).forEach((card, index) => {
          gsap.fromTo(card,
            { y: '10vh', rotation: -1, scale: 0.98, opacity: 0 },
            {
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              duration: 0.8,
              delay: index * 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });
      }

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="how-it-works"
      className="bg-[#F6F7F9] py-20 lg:py-32"
    >
      <div className="w-full px-6 lg:px-[6vw]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-12 mb-12 lg:mb-16">
          <h2 
            ref={headlineRef}
            className="font-['Space_Grotesk'] font-bold text-[#0B0F17] leading-[0.95]"
            style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}
          >
            How it works
          </h2>
          
          <p 
            ref={paragraphRef}
            className="text-[#6B7280] lg:max-w-[40vw] leading-relaxed"
            style={{ fontSize: 'clamp(15px, 1.5vw, 18px)' }}
          >
            From search to signed agreement—simple, transparent, and built for Dubai's short-term rental market.
          </p>
        </div>

        {/* Cards */}
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-[28px] p-8 lg:p-10 card-shadow hover:translate-y-[-6px] transition-transform duration-300"
            >
              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ 
                  backgroundColor: `${step.color}15`,
                  border: `2px solid ${step.color}`
                }}
              >
                <step.icon size={28} style={{ color: step.color }} />
              </div>
              
              {/* Title */}
              <h3 className="font-['Space_Grotesk'] font-bold text-2xl lg:text-3xl text-[#0B0F17] mb-4">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-[#6B7280] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
