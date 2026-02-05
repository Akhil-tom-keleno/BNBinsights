import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        // Fallback: empty users list
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-2xl font-bold text-[#0B0F17]">Users</h2>
          <p className="text-[#6B7280]">Manage admin and manager accounts</p>
        </div>
        <button className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2">
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 card-shadow">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F9]">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">User</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Role</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Joined</th>
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0B0F17]/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#F6F7F9]/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="text-purple-600" size={20} />
                        ) : (
                          <UserIcon className="text-blue-600" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F17]">{user.name}</p>
                        <p className="text-sm text-[#6B7280]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Manager'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString() 
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
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
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No users found</p>
          </div>
        )}
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> User management is in development. Full CRUD operations will be available in the next update.
        </p>
      </div>
    </div>
  );
}
