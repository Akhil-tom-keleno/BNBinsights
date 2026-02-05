import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Navigation />
      
      {/* Header */}
      <div className="bg-[#0B0F17] pt-24 pb-12">
        <div className="w-full px-6 lg:px-[6vw]">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-[#D4A23F] mb-6">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <h1 className="font-['Space_Grotesk'] font-bold text-white text-3xl lg:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#A7B1C2]">
            Last updated: January 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 lg:px-[6vw] py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 lg:p-10 card-shadow">
          <div className="prose prose-lg max-w-none prose-headings:font-['Space_Grotesk'] prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-a:text-[#D4A23F]">
            <p>
              At BNBinsights, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, phone number, and other information you voluntarily provide</li>
              <li><strong>Property Information:</strong> Details about properties you own or manage</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
              <li><strong>Device Data:</strong> Information about your device and browser</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Connect property owners with management companies</li>
              <li>Process applications and inquiries</li>
              <li>Send you relevant communications</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>3. Sharing Your Information</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Property Management Companies:</strong> When you request to be connected with managers</li>
              <li><strong>Service Providers:</strong> Third parties that help us operate our business</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>5. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to certain processing activities</li>
              <li>Withdraw consent</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@bnbinsights.com<br />
              <strong>Address:</strong> Dubai, United Arab Emirates
            </p>
          </div>
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
}
