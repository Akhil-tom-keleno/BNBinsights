import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Star, CheckCircle, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Manager {
  id: number;
  name: string;
  slug: string;
  location_name: string;
  listings_count: number;
  rating: number;
  is_featured: number;
  is_active: number;
  is_claimed: number;
}

export default function AdminManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/managers?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this manager?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/managers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to delete manager:', error);
    }
  };

  const handleToggleFeatured = async (manager: Manager) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/managers/${manager.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !manager.is_featured })
      });
      fetchManagers();
    } catch (error) {
      console.error('Failed to update manager:', error);
    }
  };

  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0B0F17]">Property Managers</h2>
          <p className="text-[#6B7280]">Manage your property manager listings</p>
        </div>
        <button className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2">
          <Plus size={20} />
          Add Manager
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 card-shadow">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input
            type="text"
            placeholder="Search managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F9]">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Manager</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Location</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Listings</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Rating</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0B0F17]/5">
              {filteredManagers.map((manager) => (
                <tr key={manager.id} className="hover:bg-[#F6F7F9]/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D4A23F]/10 rounded-lg flex items-center justify-center">
                        <span className="font-semibold text-[#D4A23F]">
                          {manager.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F17]">{manager.name}</p>
                        {manager.is_featured && (
                          <span className="text-xs text-[#D4A23F] flex items-center gap-1">
                            <Star size={12} fill="currentColor" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">{manager.location_name || '-'}</td>
                  <td className="px-6 py-4 text-[#0B0F17]">{manager.listings_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-amber-400" size={16} fill="currentColor" />
                      <span className="font-medium">{manager.rating || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {manager.is_claimed ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle size={14} />
                          Claimed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                          <XCircle size={14} />
                          Unclaimed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleFeatured(manager)}
                        className={`p-2 rounded-lg transition-colors ${
                          manager.is_featured 
                            ? 'bg-amber-100 text-amber-600' 
                            : 'hover:bg-[#F6F7F9] text-[#6B7280]'
                        }`}
                        title={manager.is_featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star size={18} fill={manager.is_featured ? 'currentColor' : 'none'} />
                      </button>
                      <a 
                        href={`/manager/${manager.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-[#F6F7F9] rounded-lg text-[#6B7280]"
                      >
                        <Eye size={18} />
                      </a>
                      <button 
                        onClick={() => { /* Edit functionality to be implemented */ }}
                        className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(manager.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredManagers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No managers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
