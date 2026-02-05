import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Building2, User, Mail, Phone, Globe, Clock, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Claim {
  id: string;
  userId: number;
  managerId: number;
  companyName: string;
  website: string;
  yearFounded: string;
  teamSize: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  howDidYouHear: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers/claims/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        setClaims([]);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      setClaims(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
      setClaims([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (claimId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/managers/claims/${claimId}/review`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes: reviewNotes })
      });
      
      setSelectedClaim(null);
      setReviewNotes('');
      fetchClaims();
    } catch (error) {
      console.error('Failed to review claim:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#D4A23F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0B0F17]">Pending Claims</h2>
        <p className="text-[#6B7280]">Review and approve listing claims from property managers</p>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 card-shadow text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-[#0B0F17] mb-2">All Caught Up!</h3>
          <p className="text-[#6B7280]">No pending claims to review at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-2xl p-6 card-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#D4A23F]/10 rounded-xl flex items-center justify-center">
                    <Building2 className="text-[#D4A23F]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0B0F17]">{claim.companyName}</h3>
                    <a 
                      href={claim.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[#D4A23F] flex items-center gap-1 hover:underline"
                    >
                      <Globe size={14} />
                      {claim.website}
                    </a>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm text-[#6B7280]">
                  <Clock size={14} />
                  {new Date(claim.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-[#6B7280]" />
                  <span className="text-[#0B0F17]">{claim.fullName}</span>
                  {claim.jobTitle && (
                    <span className="text-[#6B7280]">({claim.jobTitle})</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-[#6B7280]" />
                  <span className="text-[#0B0F17]">{claim.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-[#6B7280]" />
                  <span className="text-[#0B0F17]">{claim.phone}</span>
                </div>
                {(claim.yearFounded || claim.teamSize) && (
                  <div className="flex items-center gap-4 text-sm">
                    {claim.yearFounded && (
                      <span className="text-[#6B7280]">
                        Founded: <span className="text-[#0B0F17]">{claim.yearFounded}</span>
                      </span>
                    )}
                    {claim.teamSize && (
                      <span className="text-[#6B7280]">
                        Team: <span className="text-[#0B0F17]">{claim.teamSize}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Message */}
              {claim.message && (
                <div className="bg-[#F6F7F9] rounded-xl p-4 mb-6">
                  <p className="text-sm text-[#6B7280]">{claim.message}</p>
                </div>
              )}

              {/* Actions */}
              {selectedClaim?.id === claim.id ? (
                <div className="space-y-4">
                  <textarea
                    placeholder="Add review notes (optional)..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(claim.id, 'approved')}
                      className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(claim.id, 'rejected')}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                  <button
                    onClick={() => { setSelectedClaim(null); setReviewNotes(''); }}
                    className="w-full py-2 text-[#6B7280] hover:text-[#0B0F17]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="flex-1 btn-gold py-3 rounded-xl font-medium"
                  >
                    Review Claim
                  </button>
                  <a
                    href={`/manager/${claim.managerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 border border-[#0B0F17]/10 rounded-xl hover:border-[#D4A23F] text-[#6B7280] hover:text-[#D4A23F] transition-colors"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
