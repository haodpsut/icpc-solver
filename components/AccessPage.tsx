
import React, { useState } from 'react';
import { ACCESS_TOKEN } from '../constants';

interface AccessPageProps {
  onAccessGranted: () => void;
}

const AccessPage: React.FC<AccessPageProps> = ({ onAccessGranted }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token === ACCESS_TOKEN) {
      setError('');
      onAccessGranted();
    } else {
      setError('Invalid access token. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary">Enter Access Token</h1>
          <p className="mt-2 text-text-secondary">You need a valid token to proceed.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border-color rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors duration-200"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessPage;
