import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  Activity, 
  Share2, 
  FileText, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  Wifi, 
  Zap,
  Building2,
  Users,
  FileEdit,
  UserCircle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Matcher from './components/Matcher';
import NetworkGraph from './components/NetworkGraph';
import DriftRadar from './components/DriftRadar';
import CompanyMarket from './components/CompanyMarket';
import BatchScreening from './components/BatchScreening';
import JDAuditor from './components/JDAuditor';
import LandingPage from './components/LandingPage';
import { AuthPages } from './components/AuthPages';
import { Profile } from './components/Profile';
import { checkBackendHealth } from './services/api';
import { AppProvider, useApp } from './context/AppContext';

const Navigation = ({ portalMode }) => {
  const location = useLocation();

  const studentNav = [
    { path: '/dashboard', label: 'Overview', icon: Activity },
    { path: '/profile', label: 'My Profile', icon: UserCircle },
    { path: '/matcher', label: 'Roadmap Studio', icon: FileText },
    { path: '/companies', label: 'Company Demand', icon: Building2 },
    { path: '/graph', label: 'Skill Network', icon: Share2 },
    { path: '/radar', label: 'Drift Radar', icon: Radio },
  ];

  const recruiterNav = [
    { path: '/batch-screening', label: 'ATS Pipeline', icon: Users },
    { path: '/jd-auditor', label: 'JD Auditor', icon: FileEdit },
    { path: '/companies', label: 'Market Demand', icon: Building2 },
    { path: '/graph', label: 'Skill Network', icon: Share2 },
    { path: '/radar', label: 'Drift Radar', icon: Radio },
  ];

  const currentNav = portalMode === 'student' ? studentNav : recruiterNav;

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {currentNav.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        const activeColor = portalMode === 'student' ? 'var(--accent-cyan)' : 'var(--accent-purple)';
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={16} color={isActive ? activeColor : 'currentColor'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const AuthGate = () => {
  const { auth } = useApp();
  const [authRoute, setAuthRoute] = useState('landing'); // landing, login, register

  if (auth.isAuthenticated) {
    return <AuthenticatedApp />;
  }

  if (authRoute === 'landing') return <LandingPage onNavigate={setAuthRoute} />;
  return <AuthPages mode={authRoute} onNavigate={setAuthRoute} />;
};

const AuthenticatedApp = () => {
  const [theme, setTheme] = useState('light'); // Professional Light theme default
  const [backendStatus, setBackendStatus] = useState({ isLive: false, port: null, checking: true });
  const { activeUser, logoutUser } = useApp();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const verifyBackend = async () => {
    setBackendStatus(prev => ({ ...prev, checking: true }));
    const health = await checkBackendHealth();
    setBackendStatus({ isLive: health.isLive, port: health.port, checking: false });
  };

  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const portalMode = activeUser?.role || 'student';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Gradient Banner / Notification */}
      <div style={{ 
        background: portalMode === 'student' 
          ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.1), rgba(79, 70, 229, 0.1))'
          : 'linear-gradient(90deg, rgba(124, 58, 237, 0.1), rgba(79, 70, 229, 0.1))', 
        borderBottom: '1px solid var(--border-subtle)',
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
        gap: '8px',
        fontWeight: 500
      }}>
        <span>
          {portalMode === 'student' ? (
            <><strong>Student Portal:</strong> Discover emergent skills, view your Concept Drift score, and use verified certificates to gain Trust Points.</>
          ) : (
            <><strong>Recruiter Portal:</strong> Identify top-tier talent hidden by legacy ATS systems using real-time skill drift detection and Trust Points.</>
          )}
        </span>
      </div>

      {/* Global Navigation Header */}
      <header style={{ 
        borderBottom: '1px solid var(--border-subtle)', 
        backgroundColor: 'var(--bg-glass)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky', 
        top: 0, 
        zIndex: 50 
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: '20px' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to={portalMode === 'student' ? '/dashboard' : '/batch-screening'} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '8px', 
                background: portalMode === 'student' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: portalMode === 'student' ? 'var(--glow-cyan)' : '0 0 20px rgba(124, 58, 237, 0.35)'
              }}>
                <Zap size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    Skill<span className="gradient-text">Shift</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <Navigation portalMode={portalMode} />

          {/* Right Controls: User Profile & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* User Profile / Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeUser?.name}</span>
              <span className={portalMode === 'student' ? 'badge badge-cyan' : 'badge badge-emerald'} style={{ padding: '2px 6px', fontSize: '0.625rem' }}>
                {portalMode.toUpperCase()}
              </span>
              <button 
                onClick={logoutUser}
                style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                title="Logout"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            
            {/* Theme Toggle Button */}
            <button 
              className="btn-icon" 
              onClick={toggleTheme} 
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              {theme === 'dark' ? <Sun size={20} color="var(--accent-amber)" /> : <Moon size={20} color="var(--accent-indigo)" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Routed Content Area */}
      <main style={{ flex: 1, width: '100%', background: 'var(--bg-canvas)' }}>
        <Routes>
          <Route path="/" element={<Navigate to={portalMode === 'student' ? "/profile" : "/batch-screening"} replace />} />
          <Route path="/dashboard" element={<Dashboard isBackendLive={backendStatus.isLive} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/graph" element={<NetworkGraph isBackendLive={backendStatus.isLive} />} />
          <Route path="/matcher" element={<Matcher isBackendLive={backendStatus.isLive} />} />
          <Route path="/companies" element={<CompanyMarket isBackendLive={backendStatus.isLive} />} />
          <Route path="/radar" element={<DriftRadar isBackendLive={backendStatus.isLive} />} />
          <Route path="/batch-screening" element={<BatchScreening isBackendLive={backendStatus.isLive} />} />
          <Route path="/jd-auditor" element={<JDAuditor isBackendLive={backendStatus.isLive} />} />
        </Routes>
      </main>

      {/* Modern Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', padding: '28px 0', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={13} color="#ffffff" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <strong>SkillShift</strong> — Advanced Concept Drift & AI Job Market Intelligence Platform
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>SentenceTransformers: all-MiniLM-L6-v2</span>
            <span>•</span>
            <span>IsolationForest Anomaly Detector</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AuthGate />
      </Router>
    </AppProvider>
  );
};

export default App;
