import { Link } from 'react-router-dom';

const footerLinks = {
  browse: [
    { label: 'Markets', href: '/locations' },
    { label: 'Managers', href: '/managers' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
  ],
};

export default function SimpleFooter() {
  return (
    <footer className="border-t border-[#0B0F17]/8 bg-[#F6F7F9]">
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
  );
}
