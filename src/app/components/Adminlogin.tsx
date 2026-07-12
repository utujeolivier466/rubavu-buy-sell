import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import { supabase } from '../../../lib/libsupabaseClient';

type Mode = 'login' | 'forgot';

function AdminLogin() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Already logged in? Skip the login form entirely.
  if (!loading && session) {
    const from = (location.state as { from?: string })?.from || '/admin/properties';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Incorrect email or password.');
      setSubmitting(false);
      return;
    }

    navigate('/admin/properties');
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetSubmitting(true);
    setResetError(null);

    const { error } = await supabase!.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      console.error('Password reset request failed:', error);
      setResetError('Could not send the reset link. Please check the email and try again.');
      setResetSubmitting(false);
      return;
    }

    setResetSent(true);
    setResetSubmitting(false);
  }

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h1>
          <p className="text-sm text-gray-500 mb-6">Rubavu Buy and Sell Ltd</p>

          {resetSent ? (
            <div>
              <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 mb-4">
                If an account exists for that email, a reset link has been sent. Check your inbox (and spam folder).
              </p>
              <button
                onClick={() => { setMode('login'); setResetSent(false); setResetEmail(''); }}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                ← Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {resetError && <p className="text-sm text-red-600">{resetError}</p>}

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                {resetSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">Rubavu Buy and Sell Ltd</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setMode('forgot')}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;