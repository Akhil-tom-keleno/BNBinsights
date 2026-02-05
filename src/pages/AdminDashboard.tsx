import { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  FileText, 
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Admin Sub-pages
import AdminOverview from './admin/AdminOverview';
import AdminManagers from './admin/AdminManagers';
import AdminLocations from './admin/AdminLocations';
import AdminBlog from './admin/AdminBlog';
import AdminUsers from './admin/AdminUsers';
import AdminClaims from './admin/AdminClaims';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/managers', label: 'Managers', icon: Building2 },
  { path: '/admin/locations', label: 'Locations', icon: MapPin },
  { path: '/admin/blog', label: 'Blog Posts', icon: FileText },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/claims', label: 'Claims', icon: Bell },
];

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    managers: 0,
    locations: 0,
    users: 0,
    posts: 0,
    pendingClaims: 0
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [managersRes, locationsRes, usersRes, postsRes, claimsRes] = await Promise.all([
        fetch(`${API_URL}/managers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/locations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}/blog`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/managers/claims/pending`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ json: () => [] }))
      ]);

      const [managers, locations, users, posts, claims] = await Promise.all([
        managersRes.json(),
        locationsRes.json(),
        usersRes.json?.() || [],
        postsRes.json(),
        claimsRes.json?.() || []
      ]);

      setStats({
        managers: Array.isArray(managers) ? managers.length : 0,
        locations: Array.isArray(locations) ? locations.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        posts: Array.isArray(posts) ? posts.length : 0,
        pendingClaims: Array.isArray(claims) ? claims.length : 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9]">
        <div className="w-12 h-12 border-4 border-[#D4A23F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex">
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 bg-[#0B0F17] transition-all duration-300
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/admin" className={`flex items-center gap-3 ${!isSidebarOpen && 'lg:hidden'}`}>
              <div className="w-10 h-10 bg-[#D4A23F] rounded-xl flex items-center justify-center">
                <span className="font-['Space_Grotesk'] font-bold text-white text-lg">B</span>
              </div>
              <span className="font-['Space_Grotesk'] font-bold text-white text-xl">BNBinsights</span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive 
                      ? 'bg-[#D4A23F] text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                    ${!isSidebarOpen && 'lg:justify-center lg:px-2'}
                  `}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon size={20} />
                  <span className={`${!isSidebarOpen && 'lg:hidden'}`}>{item.label}</span>
                  {item.path === '/admin/claims' && stats.pendingClaims > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {stats.pendingClaims}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10">
            <Link
              to="/"
              className={`
                flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors
                ${!isSidebarOpen && 'lg:justify-center lg:px-2'}
              `}
            >
              <ChevronRight size={20} className="rotate-180" />
              <span className={`${!isSidebarOpen && 'lg:hidden'}`}>Back to Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-red-400 transition-colors
                ${!isSidebarOpen && 'lg:justify-center lg:px-2'}
              `}
            >
              <LogOut size={20} />
              <span className={`${!isSidebarOpen && 'lg:hidden'}`}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#0B0F17]/10 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-[#F6F7F9] rounded-lg lg:hidden"
              >
                <Menu size={24} />
              </button>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex p-2 hover:bg-[#F6F7F9] rounded-lg"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-[#0B0F17]">
                {navItems.find(item => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-[#0B0F17]/10 focus:border-[#D4A23F] focus:outline-none w-64"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4A23F] rounded-full flex items-center justify-center">
                  <span className="font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-[#0B0F17]">{user.name}</p>
                  <p className="text-sm text-[#6B7280]">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<AdminOverview stats={stats} />} />
            <Route path="/managers" element={<AdminManagers />} />
            <Route path="/locations" element={<AdminLocations />} />
            <Route path="/blog" element={<AdminBlog />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/claims" element={<AdminClaims />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
