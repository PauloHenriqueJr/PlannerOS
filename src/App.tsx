/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth, AppProvider } from './store';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PlannerApp from './pages/PlannerApp';

function Header() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-line bg-white shrink-0">
      <div className="flex items-center space-x-4 sm:space-x-12">
        <Link to="/" className="text-xl sm:text-2xl font-serif font-bold tracking-tighter text-ink hover:opacity-80 transition-opacity">PLANN.OS</Link>
        <div className="flex space-x-6 text-sm font-medium opacity-70 hidden sm:flex">
          <Link to="/" className="hover:opacity-100 transition-opacity">Library</Link>
          <a href="#" className="hover:opacity-100 transition-opacity pointer-events-none">Marketplace</a>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        {user ? (
          <>
            <Link to="/dashboard" className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-accent hover:opacity-80 transition-opacity">
              My Dashboard
            </Link>
            <div className="hidden sm:block h-4 border-l border-line mx-2"></div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-xs font-bold text-ink" title={user.name}>
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <button 
                onClick={logout}
                className="text-[10px] sm:text-xs text-ink opacity-60 hover:opacity-100 transition-opacity uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-4 sm:px-5 py-2 rounded hover:opacity-90 transition-opacity">
            Log in
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
          <main className="flex flex-col flex-1 overflow-auto">
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

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="flex flex-1 w-full items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-6 sm:p-10 rounded-xl border border-line shadow-2xl text-center">
        <h1 className="font-serif text-3xl italic mb-2">Welcome Back</h1>
        <p className="text-sm opacity-50 mb-8">Sign in to access your digital planners.</p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = (e.target as any).email.value;
          if (email) {
            login(email);
            navigate('/dashboard');
          }
        }} className="flex flex-col gap-5">
          <div className="text-left">
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="you@example.com" 
              required
              className="w-full px-4 py-3 rounded bg-sidebar border border-line focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>
          <button 
            type="submit"
            className="w-full text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-5 py-3 rounded mt-2 hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
