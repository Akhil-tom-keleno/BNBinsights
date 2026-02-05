import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/sections/Navigation';
import SimpleFooter from '@/sections/SimpleFooter';

export default function Terms() {
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
            Terms of Service
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
              Welcome to BNBinsights. By accessing or using our website and services, you agree to be bound by these Terms of Service.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using BNBinsights, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.
            </p>

            <h2>2. Description of Services</h2>
            <p>
              BNBinsights is a directory platform that connects property owners with vacation rental management companies in Dubai. We provide:
            </p>
            <ul>
              <li>A searchable directory of property management companies</li>
              <li>Company profiles and reviews</li>
              <li>Connection services between owners and managers</li>
              <li>Educational content and resources</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              To access certain features, you may need to create an account. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>

            <h2>4. For Property Owners</h2>
            <p>When using our services as a property owner, you agree to:</p>
            <ul>
              <li>Provide accurate information about your property and needs</li>
              <li>Use the platform in good faith to find management services</li>
              <li>Not misuse the contact information of management companies</li>
              <li>Provide honest reviews based on actual experiences</li>
            </ul>

            <h2>5. For Management Companies</h2>
            <p>When listing your company on BNBinsights, you agree to:</p>
            <ul>
              <li>Provide accurate and up-to-date company information</li>
              <li>Maintain appropriate licenses and insurance</li>
              <li>Respond to inquiries in a timely manner</li>
              <li>Not engage in deceptive or fraudulent practices</li>
              <li>Pay any applicable listing fees</li>
            </ul>

            <h2>6. Reviews and Ratings</h2>
            <p>
              Users may submit reviews and ratings. By submitting a review, you:
            </p>
            <ul>
              <li>Confirm that your review is based on genuine experience</li>
              <li>Grant us a license to display your review</li>
              <li>Agree not to submit false, misleading, or defamatory content</li>
            </ul>
            <p>
              We reserve the right to remove reviews that violate these terms.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on BNBinsights, including text, graphics, logos, and software, is our property or the property of our licensors and is protected by copyright and other intellectual property laws.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              BNBinsights is a platform for connecting parties. We are not responsible for:
            </p>
            <ul>
              <li>The quality of services provided by management companies</li>
              <li>Disputes between property owners and management companies</li>
              <li>Any damages arising from your use of our services</li>
              <li>Third-party websites linked from our platform</li>
            </ul>

            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless BNBinsights and its affiliates from any claims, damages, or expenses arising from your use of our services or violation of these terms.
            </p>

            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these terms or for any other reason at our discretion.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of the United Arab Emirates. Any disputes shall be resolved in the courts of Dubai.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@bnbinsights.com<br />
              <strong>Address:</strong> Dubai, United Arab Emirates
            </p>
          </div>
        </div>
      </div>
      
      <SimpleFooter />
    </div>
  );
}
