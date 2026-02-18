import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Shield, X, Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface UserData {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  created_at: string;
}

interface UserFormData {
  email: string;
  name: string;
  role: 'admin' | 'manager';
  password: string;
}

const initialFormData: UserFormData = {
  email: '',
  name: '',
  role: 'manager',
  password: ''
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      password: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingUser 
        ? `${API_URL}/admin/users/${editingUser.id}`
        : `${API_URL}/admin/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const body: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role
      };
      
      if (!editingUser || formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        closeModal();
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save user');
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
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
        <button 
          onClick={openCreateModal}
          className="btn-gold px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
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
                <th className="text-left px-6 py-4 font-semibold text-[#0B0F17]">Created</th>
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
                          <User className="text-blue-600" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#0B0F17]">{user.name}</p>
                        <p className="text-sm text-[#6B7280] flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
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
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 hover:bg-[#F6F7F9] rounded-lg text-blue-600"
                      >
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#0B0F17]/10 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#0B0F17]">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder="user@example.com"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'manager'})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  required
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#0B0F17] mb-2">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none"
                  placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-[#0B0F17]/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border-2 border-[#0B0F17]/10 rounded-xl font-medium hover:border-[#D4A23F] hover:text-[#D4A23F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-gold px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
