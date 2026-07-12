import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/libsupabaseClient';

function AdminResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase automatically parses the recovery token from the URL
    // and fires this event once a temporary session is established.
    const { data: listener } = supabase!.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Fallback: if the event already fired before this component mounted,
    // check for an existing session directly.
    supabase!.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase!.auth.updateUser({ password });

    if (updateError) {
      console.error('Password update failed:', updateError);
      setError('Could not update your password. The reset link may have expired — request a new one.');
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => navigate('/admin/properties'), 2000);
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 text-sm">
            Verifying your reset link… If this doesn't finish in a few seconds, the link may be invalid or expired.
            Request a new one from the login page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Set a New Password</h1>
        <p className="text-sm text-gray-500 mb-6">Rubavu Buy and Sell Ltd</p>

        {success ? (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
            Password updated. Redirecting you to the dashboard…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminResetPassword;