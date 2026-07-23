import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';
import { useAuth } from '../context/Authcontext';
import type { Agent } from '../../../lib/types';

function AdminAgents() {
  const { isOwner } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setLoading(true);
    const { data, error } = await supabase!
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load agents:', error);
    } else {
      setAgents(data as Agent[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remove "${name}" from the team? Properties assigned to them will keep their listing but show no agent.`)) return;

    setDeletingId(id);
    const { error } = await supabase!.from('agents').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete agent:', error);
      alert('Could not remove this agent. Please try again.');
    } else {
      setAgents((prev) => prev.filter((a) => a.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team / Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Appears on the About page and can be assigned to property listings.</p>
        </div>
        <Link
          to="/admin/agents/new"
          className="bg-[#D56000] hover:bg-[#A84A00] text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          + Add Agent
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-32" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-4">No agents added yet. The About page currently shows only the CEO.</p>
          <Link to="/admin/agents/new" className="text-[#D56000] hover:text-[#A84A00] font-medium">
            Add your first agent →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
              {agent.photo_url ? (
                <img src={agent.photo_url} alt={agent.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold shrink-0">
                  {agent.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{agent.name}</p>
                <p className="text-xs text-gray-500 truncate">{agent.position}</p>
                <div className="flex gap-3 mt-2">
                  <Link to={`/admin/agents/${agent.id}/edit`} className="text-[#0D4F2A] hover:text-[#0A3B21] font-medium text-xs">
                    Edit
                  </Link>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(agent.id, agent.name)}
                      disabled={deletingId === agent.id}
                      className="text-red-500 hover:text-red-600 font-medium text-xs disabled:opacity-50"
                    >
                      {deletingId === agent.id ? 'Removing…' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAgents;