import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/Authcontext';

function AdminLayout() {
  const { signOut, session, isOwner, role } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-[var(--color-brand-orange)] text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;

  const navLinks = (
    <>
      <NavLink to="/admin/properties" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
        Properties
      </NavLink>
      <NavLink to="/admin/submissions" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
        Pending Inquiries
      </NavLink>
      <NavLink to="/admin/inquiries" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
        Inquiries
      </NavLink>
      <NavLink to="/admin/blog" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
        Blog
      </NavLink>
      <NavLink to="/admin/agents" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
        Team / Agents
      </NavLink>
      {isOwner && (
        <NavLink to="/admin/users" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
          Manage Users
        </NavLink>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-bold text-gray-900 text-sm">Rubavu Admin</p>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">{session?.user?.email}</p>
            {role && (
            <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isOwner ? 'bg-[var(--color-brand-forest)] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {isOwner ? 'Owner' : 'Staff'}
            </span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-600"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile slide-in sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <p className="font-bold text-gray-900 text-sm">Rubavu Admin</p>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">{navLinks}</nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 bg-white border-r border-gray-200 flex-col min-h-screen sticky top-0">
          <div className="p-5 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm">Rubavu Admin</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{session?.user?.email}</p>
            {role && (
              <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isOwner ? 'bg-[var(--color-brand-forest)] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {isOwner ? 'Owner' : 'Staff'}
              </span>
            )}
          </div>

          <nav className="flex-1 p-3 space-y-1">{navLinks}</nav>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;