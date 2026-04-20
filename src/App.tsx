/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, AppProvider } from './store';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PlannerApp from './pages/PlannerApp';
import Checkout from './pages/Checkout';

function Header() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language.startsWith('en') ? 'pt' : 'en');
  };
  
  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-line bg-white shrink-0">
      <div className="flex items-center space-x-4 sm:space-x-12">
        <Link to="/" className="text-xl sm:text-2xl font-serif font-bold tracking-tighter text-ink hover:opacity-80 transition-opacity">PLANN.OS</Link>
        <div className="flex space-x-6 text-sm font-medium opacity-70 hidden sm:flex">
          <Link to="/" className="hover:opacity-100 transition-opacity">{t('library')}</Link>
          <a href="#" className="hover:opacity-100 transition-opacity pointer-events-none">{t('marketplace')}</a>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button 
          onClick={toggleLang} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-line hover:border-accent text-xs sm:text-sm font-bold text-ink bg-sidebar transition-all duration-300 mr-1 sm:mr-2"
          title="Change Language / Mudar Idioma"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span className="uppercase tracking-wider">{i18n.language.startsWith('en') ? 'EN' : 'PT'}</span>
        </button>
        {user ? (
          <>
            <Link to="/dashboard" className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-accent hover:opacity-80 transition-opacity">
              {t('dashboard')}
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
                {t('logout')}
              </button>
            </div>
          </>
        ) : (
          <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-4 sm:px-5 py-2 rounded hover:opacity-90 transition-opacity">
            {t('login')}
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
              <Route path="/checkout/:productId" element={<Checkout />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

function Login() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, navigate, isLoading]);

  if (user || isLoading) {
    return null;
  }

  return (
    <div className="flex flex-1 w-full items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-6 sm:p-10 rounded-xl border border-line shadow-2xl text-center">
        <h1 className="font-serif text-3xl italic mb-2">{t('login_title')}</h1>
        <p className="text-sm opacity-50 mb-8">{t('login_subtitle')}</p>
        
        <button 
          onClick={login}
          className="w-full flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-line text-ink p-4 rounded hover:border-accent hover:text-accent transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          {t('login_btn')}
        </button>
      </div>
    </div>
  );
}
