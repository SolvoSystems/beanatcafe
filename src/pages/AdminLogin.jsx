import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, setAdminAuthed } from '../lib/store.js';

export default function AdminLogin() {
  const { settings } = useAppState();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (pw === settings.adminPassword) {
      setAdminAuthed(true);
      navigate('/admin/orders');
    } else {
      setError('Incorrect password.');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="card p-6">
        <img src="/logo.png" alt="Bean@Cafe" className="h-12 w-auto mx-auto mb-3" />
        <h1 className="text-xl font-extrabold mb-4 text-center">Staff Login</h1>
        <p className="text-sm text-muted mb-4">Staff login. Change the password in src/lib/store.js (DEFAULT_SETTINGS.adminPassword).</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label" htmlFor="pw">Password</label>
            <input id="pw" type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          </div>
          {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
          <button type="submit" className="btn-primary w-full">Login</button>
        </form>
      </div>
    </div>
  );
}