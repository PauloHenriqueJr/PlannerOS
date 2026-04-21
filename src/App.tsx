/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, AppProvider, useTheme } from './store';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PlannerApp from './pages/PlannerApp';
import Checkout from './pages/Checkout';

  function Header() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
    const toggleLang = () => {
      i18n.changeLanguage(i18n.language.startsWith('en') ? 'pt' : 'en');
    };
    
    return (
      <nav className="flex items-center justify-between px-4 sm:px-8 h-16 border-b border-line bg-paper shrink-0 relative z-50">
        <div className="flex items-center space-x-4 sm:space-x-12">
          <Link to="/" className="text-xl sm:text-2xl font-serif font-bold tracking-tighter text-ink hover:opacity-80 transition-opacity">PLANN.OS</Link>
          <div className="flex space-x-6 text-sm font-medium opacity-70 hidden sm:flex">
            <Link to="/dashboard" className="hover:opacity-100 transition-opacity">{t('library')}</Link>
            <Link to="/#planners" className="hover:opacity-100 transition-opacity">{t('marketplace')}</Link>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-line/50 transition-colors text-ink opacity-70 hover:opacity-100"
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={toggleLang} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-line hover:border-accent text-xs sm:text-sm font-bold text-ink bg-sidebar transition-all duration-300 mr-1 sm:mr-2"
            title="Change Language / Mudar Idioma"
          >
            <span className="uppercase tracking-wider">{i18n.language.startsWith('en') ? 'EN' : 'PT'}</span>
          </button>
        {user ? (
          <>
            <Link to="/dashboard" className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-accent hover:opacity-80 transition-opacity">
              {t('dashboard')}
            </Link>
            <div className="hidden sm:block h-4 border-l border-line mx-2"></div>
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
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
          <Link to="/login" className="hidden sm:block text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-4 sm:px-5 py-2 rounded hover:opacity-90 transition-opacity">
            {t('login')}
          </Link>
        )}
        
        {/* Mobile Menu Toggle */}
        <button 
          className="sm:hidden p-2 text-ink opacity-70 hover:opacity-100 cursor-pointer ml-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-paper border-b border-line shadow-2xl flex flex-col p-6 sm:hidden space-y-6 z-50 text-center"
          >
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-ink">{t('library')}</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/#planners" className="text-sm font-bold uppercase tracking-widest text-ink">{t('marketplace')}</Link>
            {user ? (
              <>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-accent">{t('dashboard')}</Link>
                <div className="border-t border-line/50 w-24 mx-auto pt-6 flex flex-col gap-4">
                  <div className="text-xs opacity-50 uppercase tracking-widest">{user.name}</div>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-sm font-bold uppercase tracking-widest text-red-500 opacity-80">{t('logout')}</button>
                </div>
              </>
            ) : (
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/login" className="text-sm font-bold uppercase tracking-widest bg-accent text-white py-3 rounded-lg mx-auto w-3/4 max-w-xs">{t('login')}</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-paper border-t border-line py-8 px-4 sm:px-8 mt-auto shrink-0 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60 text-ink">
        <div className="font-serif italic text-lg">PLANN.OS © {new Date().getFullYear()}</div>
        <div className="flex gap-6 uppercase tracking-widest font-bold">
          <a href="#" className="hover:text-accent transition-colors">Termos de Uso</a>
          <a href="#" className="hover:text-accent transition-colors">Privacidade</a>
          <a href="mailto:suporte@planneros.com" className="hover:text-accent transition-colors">Suporte</a>
        </div>
      </div>
    </footer>
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
            <Footer />
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
      <div className="w-full max-w-sm bg-sidebar p-6 sm:p-10 rounded-xl border border-line shadow-2xl text-center">
        <h1 className="font-serif text-3xl italic mb-2">{t('login_title')}</h1>
        <p className="text-sm opacity-50 mb-8">{t('login_subtitle')}</p>
        
        <button 
          onClick={login}
          className="w-full flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest bg-sidebar border-2 border-line text-ink p-4 rounded hover:border-accent hover:text-accent transition-colors shadow-sm"
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
