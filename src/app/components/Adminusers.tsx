import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/libsupabaseClient';
import { useAuth } from '../context/Authcontext';

interface AdminUser {
  id: string;
  email: string;
  role: 'owner' | 'staff';
  created_at: string;
  last_sign_in_at: string | null;
}

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;

function AdminUsers() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function callFunction(name: string, body: object) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    const result = await callFunction('list-admin-users', {});
    if (result.error) {
      setError(result.error);
    } else {
      setUsers(result.users || []);
    }
    setLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteMessage(null);
    const result = await callFunction('invite-admin-user', { email: inviteEmail.trim() });

    if (result.error) {
      setInviteMessage(`Error: ${result.error}`);
    } else {
      setInviteMessage(`Invitation sent to ${inviteEmail}.`);
      setInviteEmail('');
      fetchUsers();
    }
    setInviting(false);
  }

  async function handleToggleRole(user: AdminUser) {
    const newRole = user.role === 'owner' ? 'staff' : 'owner';
    if (!window.confirm(`Change ${user.email} to ${newRole}?`)) return;

    setProcessingId(user.id);
    const { error } = await supabase!.from('profiles').update({ role: newRole }).eq('id', user.id);

    if (error) {
      console.error('Failed to update role:', error);
      alert('Could not update this user\'s role.');
    } else {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    }
    setProcessingId(null);
  }

  async function handleRemove(user: AdminUser) {
    if (!window.confirm(`Remove ${user.email}'s access? This cannot be undone.`)) return;

    setProcessingId(user.id);
    const result = await callFunction('remove-admin-user', { userId: user.id });

    if (result.error) {
      alert(result.error);
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
    setProcessingId(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Users</h1>
      <p className="text-sm text-gray-500 mb-6">Invite staff, assign roles, and manage admin access. Owner-only.</p>

      {/* Invite form */}
      <form onSubmit={handleInvite} className="bg-white border border-gray-200 rounded-lg p-5 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="staff@example.com"
          required
          className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]"
        />
        <button
          type="submit"
          disabled={inviting}
          className="bg-[var(--color-brand-orange)] hover:opacity-95 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
        >
          {inviting ? 'Sending…' : '+ Invite Staff Member'}
        </button>
      </form>
      {inviteMessage && (
        <p className={`text-sm mb-4 ${inviteMessage.startsWith('Error') ? 'text-red-600' : 'text-[var(--color-brand-forest)]'}`}>
          {inviteMessage}
        </p>
      )}

      {/* User list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-16" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Last Sign In</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === session?.user.id;
                return (
                  <tr key={user.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-900">
                      {user.email} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.role === 'owner' ? 'bg-[var(--color-brand-forest)] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'owner' ? 'Owner' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {!isSelf && (
                        <>
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={processingId === user.id}
                            className="text-[var(--color-brand-forest)] hover:text-[var(--color-brand-forest)] font-medium text-xs mr-4 disabled:opacity-50"
                          >
                            {user.role === 'owner' ? 'Demote to Staff' : 'Promote to Owner'}
                          </button>
                          <button
                            onClick={() => handleRemove(user)}
                            disabled={processingId === user.id}
                            className="text-red-500 hover:text-red-600 font-medium text-xs disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;