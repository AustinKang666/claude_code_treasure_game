import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { signup, signin, type AuthResponse } from '../api';

interface Props {
  onAuth: (response: AuthResponse) => void;
  onGuest: () => void;
}

type Tab = 'signin' | 'signup';

export default function AuthScreen({ onAuth, onGuest }: Props) {
  const [tab, setTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = tab === 'signup'
        ? await signup(username, password)
        : await signin(username, password);
      onAuth(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt</h1>
          <p className="text-amber-700 text-sm">Sign in to track your scores across sessions</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-200 p-6">
          <div className="flex rounded-lg bg-amber-50 p-1 mb-6">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  tab === t
                    ? 'bg-white text-amber-900 shadow-sm border border-amber-200'
                    : 'text-amber-600 hover:text-amber-800'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-amber-800">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="border-amber-200 focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-amber-800">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                required
                className="border-amber-200 focus:border-amber-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? 'Loading...' : tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-amber-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-amber-500">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={onGuest}
          >
            Play as Guest 🎭
          </Button>
        </div>
      </div>
    </div>
  );
}
