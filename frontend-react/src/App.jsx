import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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
  Layers,
  Sparkles
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Matcher from './components/Matcher';
import NetworkGraph from './components/NetworkGraph';
import DriftRadar from './components/DriftRadar';
import { checkBackendHealth } from './services/api';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/graph', label: 'Skill Network', icon: Share2 },
    { path: '/matcher', label: 'Resume Matcher', icon: FileText },
    { path: '/radar', label: 'Drift Radar', icon: Radio },
  ];

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={17} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [backendStatus, setBackendStatus] = useState({ isLive: false, port: null, checking: true });

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

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Gradient Banner / Notification */}
        <div style={{ 
          background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.15), rgba(79, 70, 229, 0.15))', 
          borderBottom: '1px solid var(--border-subtle)',
          padding: '7px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          gap: '8px'
        }}>
          <Sparkles size={14} color="var(--accent-cyan)" />
          <span>
            <strong>SkillShift Concept Drift Monitor:</strong> Tracking real-time AI & Generative terminology divergence across 2021-2024 job markets.
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
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
            
            {/* Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '12px', 
                  background: 'var(--gradient-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: 'var(--glow-cyan)'
                }}>
                  <Zap size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                      Skill<span className="gradient-text">Shift</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                    Drift Detection Engine
                  </div>
                </div>
              </Link>

              {/* Primary Nav Links */}
              <Navigation />
            </div>

            {/* Right Controls: Engine Status, Theme Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              
              {/* Engine Status Pill */}
              <div 
                className="status-indicator"
                title={backendStatus.isLive ? `Connected to FastAPI server at port ${backendStatus.port}` : "Operating in High-Fidelity Simulation Dataset mode (Offline resilience)"}
                style={{ cursor: 'pointer' }}
                onClick={verifyBackend}
              >
                <div className={`status-dot ${backendStatus.isLive ? 'active' : 'simulated'}`} />
                <span>
                  {backendStatus.checking ? 'Probing...' : backendStatus.isLive ? `Live Engine (Port ${backendStatus.port})` : 'Simulation Engine (Active)'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); verifyBackend(); }} 
                  style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                  title="Refresh engine connection"
                >
                  <RefreshCw size={13} style={{ animation: backendStatus.checking ? 'spin 1s linear infinite' : 'none' }} />
                </button>
              </div>

              {/* Theme Toggle Button */}
              <button 
                className="btn-icon" 
                onClick={toggleTheme} 
                aria-label="Toggle Theme"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--accent-indigo)" />}
              </button>
            </div>

          </div>
        </header>

        {/* Main Routed Content Area */}
        <main className="container" style={{ flex: 1, padding: '36px 24px', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Dashboard isBackendLive={backendStatus.isLive} />} />
            <Route path="/graph" element={<NetworkGraph isBackendLive={backendStatus.isLive} />} />
            <Route path="/matcher" element={<Matcher isBackendLive={backendStatus.isLive} />} />
            <Route path="/radar" element={<DriftRadar isBackendLive={backendStatus.isLive} />} />
          </Routes>
        </main>

        {/* Modern Footer */}
        <footer style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', padding: '28px 0', marginTop: 'auto' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={13} color="#ffffff" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <strong>SkillShift</strong> — Advanced Concept Drift & Out-of-Distribution Skill Detection Platform
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>SentenceTransformers: all-MiniLM-L6-v2</span>
              <span>•</span>
              <span>Detector: IsolationForest (0.05 contamination)</span>
              <span>•</span>
              <span>Baseline: 2021 DataScientist Corpus</span>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
};

export default App;
