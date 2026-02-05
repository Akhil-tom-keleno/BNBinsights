import { Building2, MapPin, Users, FileText, Bell, TrendingUp } from 'lucide-react';

interface Stats {
  managers: number;
  locations: number;
  users: number;
  posts: number;
  pendingClaims: number;
}

interface AdminOverviewProps {
  stats: Stats;
}

export default function AdminOverview({ stats }: AdminOverviewProps) {
  const statCards = [
    { label: 'Property Managers', value: stats.managers, icon: Building2, color: 'bg-blue-500' },
    { label: 'Locations', value: stats.locations, icon: MapPin, color: 'bg-green-500' },
    { label: 'Users', value: stats.users, icon: Users, color: 'bg-purple-500' },
    { label: 'Blog Posts', value: stats.posts, icon: FileText, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#0B0F17] to-[#1a1f2e] rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h2>
        <p className="text-white/70">Manage your property managers, locations, content, and users from one place.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <TrendingUp size={16} />
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-[#0B0F17]">{card.value}</p>
              <p className="text-[#6B7280]">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Claims Alert */}
      {stats.pendingClaims > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <Bell className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Pending Claims</h3>
            <p className="text-amber-700">You have {stats.pendingClaims} listing claim{stats.pendingClaims > 1 ? 's' : ''} awaiting review.</p>
          </div>
          <a 
            href="/admin/claims" 
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            Review Now
          </a>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h3 className="font-semibold text-[#0B0F17] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a 
              href="/admin/managers" 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-[#0B0F17]">Add Manager</p>
                <p className="text-sm text-[#6B7280]">Create a new property manager profile</p>
              </div>
            </a>
            <a 
              href="/admin/blog" 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F7F9] transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-[#0B0F17]">New Blog Post</p>
                <p className="text-sm text-[#6B7280]">Write and publish a new article</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h3 className="font-semibold text-[#0B0F17] mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Database</span>
              <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">API Status</span>
              <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Last Backup</span>
              <span className="text-sm text-[#0B0F17]">Today, 03:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
