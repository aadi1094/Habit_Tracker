import { FormEvent, useState } from 'react';
import { login, register } from './api/client';

type AuthProps = {
  onAuthenticated: () => void;
};

const Auth = ({ onAuthenticated }: AuthProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        localStorage.setItem('auth_token', result.token);
      } else {
        await register(email, password);
        const result = await login(email, password);
        localStorage.setItem('auth_token', result.token);
      }

      onAuthenticated();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {mode === 'login' ? 'Login to Habit Tracker' : 'Create your Habit Tracker account'}
        </h1>

        <div className="flex justify-center mb-4 space-x-4">
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;

