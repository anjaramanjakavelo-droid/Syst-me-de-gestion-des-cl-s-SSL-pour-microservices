import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, ShieldCheck, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { useState } from 'react';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg mx-3 transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
    } ${collapsed ? 'justify-center px-2' : ''}`;

  return (
    <aside className={`bg-sidebar h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo/Brand */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <span className="text-white font-bold text-lg">SWM</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-sidebar-hover text-gray-300 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Tableau de bord</span>}
        </NavLink>

        <NavLink to="/services" className={linkClass}>
          <Server className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Services</span>}
        </NavLink>

        <NavLink to="/certificates" className={linkClass}>
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Certificats</span>}
        </NavLink>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-700/50">
        {!collapsed && (
          <div className="mb-3 px-2">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
              isAdmin ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {user?.role === 'admin' ? 'Administrateur' : 'Service'}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-lg px-4 py-3 transition-all duration-200 w-full ${
            collapsed ? 'justify-center px-2' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
