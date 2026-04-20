import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth, AppProvider } from './store';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PlannerApp from './pages/PlannerApp';

function Header() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-8 h-16 border-b border-line bg-white shrink-0">
      <div className="flex items-center space-x-10">
        <Link to="/" className="text-2xl font-serif font-bold tracking-tighter text-ink hover:opacity-80 transition-opacity">
          PLANN.OS
        </Link>
        <div className="hidden sm:flex space-x-6 text-sm font-medium opacity-60">
          <Link to="/" className="hover:opacity-100 transition-opacity">Store</Link>
          {user && <Link to="/dashboard" className="hover:opacity-100 transition-opacity">My Library</Link>}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/dashboard" className="text-[10px] uppercase font-bold tracking-widest text-accent hover:opacity-80 transition-opacity hidden sm:block">
              Dashboard
            </Link>
            <div className="h-4 border-l border-line mx-1"></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent" title={user.email}>
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="text-xs text-ink opacity-50 hover:opacity-100 transition-opacity uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-5 py-2 rounded hover:opacity-90 transition-opacity">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen overflow-hidden bg-paper text-ink font-sans">
          <Header />
          <main className="flex flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/planner/:id" element={<PlannerApp />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    // Simulate async auth call (replace with real API call in production)
    await new Promise(r => setTimeout(r, 600));
    const success = login(email, password);
    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Wrong password. If you are new, use a password with 6+ characters to create your account.');
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-10 rounded-2xl border border-line shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter text-ink">PLANN.OS</Link>
          <h1 className="font-serif text-2xl italic mt-4 mb-1">Welcome back</h1>
          <p className="text-sm opacity-50">Sign in to access your digital planners.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-sidebar border border-line focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="w-full px-4 py-3 rounded-lg bg-sidebar border border-line focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-5 py-3 rounded-lg mt-1 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Continue'}
          </button>
          <p className="text-center text-[10px] opacity-40 uppercase tracking-wider">
            New here? Just enter your email + a password to create your account.
          </p>
        </form>
      </div>
    </div>
  );
}
