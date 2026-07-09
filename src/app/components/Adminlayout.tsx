import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

function AdminLayout() {
  const { signOut, session } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <p className="font-bold text-gray-900 text-sm">Rubavu Admin</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{session?.user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin/properties" className={navLinkClass}>
            Properties
          </NavLink>
          <NavLink to="/admin/inquiries" className={navLinkClass}>
            Inquiries
          </NavLink>
        </nav>

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
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;