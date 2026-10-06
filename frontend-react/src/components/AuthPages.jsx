import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuthPages = ({ mode = 'login', onNavigate }) => {
  const { registerUser, loginUser } = useApp();
  const [formMode, setFormMode] = useState(mode); // 'login' or 'register'
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [education, setEducation] = useState('');
  const [claimedSkills, setClaimedSkills] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formMode === 'register') {
      if (!name || !email || !password) {
        setError('Name, Email, and Password are required.');
        return;
      }
      const skillsArray = claimedSkills.split(',').map(s => s.trim()).filter(Boolean);
      registerUser({
        name,
        email,
        password,
        role,
        education,
        claimedSkills: skillsArray
      });
      // Redirect handled by App.jsx based on auth state
    } else {
      if (!email || !password) {
        setError('Email and Password are required.');
        return;
      }
      const success = loginUser(email, password);
      if (!success) {
        setError('Invalid credentials. Check your email or password.');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '40px', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-cyan)', padding: '12px', borderRadius: '16px', marginBottom: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            {formMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {formMode === 'login' ? 'Sign in to access your dashboard' : 'Join SkillShift to bridge the talent gap'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {formMode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Full Name *</label>
                <input type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>I am a... *</label>
                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Student / Job Seeker</option>
                  <option value="recruiter">Recruiter / Hiring Manager</option>
                </select>
              </div>
              
              {role === 'student' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Education</label>
                    <input type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} value={education} onChange={e => setEducation(e.target.value)} placeholder="B.S. Computer Science" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Claimed Skills (comma separated)</label>
                    <input type="text" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} value={claimedSkills} onChange={e => setClaimedSkills(e.target.value)} placeholder="React, Python, Machine Learning" />
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email Address *</label>
            <input type="email" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Password *</label>
            <input type="password" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)' }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {formMode === 'login' ? 'Sign In Securely' : 'Create Account'}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {formMode === 'login' ? (
            <>
              Don't have an account? <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setFormMode('register')}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account? <span style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setFormMode('login')}>Sign in</span>
            </>
          )}
        </div>

        {formMode === 'login' && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                className="card-interactive"
                onClick={() => {
                  setEmail('alex@skillshift.com');
                  setPassword('password123');
                  if (!loginUser('alex@skillshift.com', 'password123')) setError('Invalid credentials.');
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Student: <strong>alex@skillshift.com</strong></span>
                <span style={{ color: 'var(--text-tertiary)' }}>pwd: password123</span>
              </div>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                className="card-interactive"
                onClick={() => {
                  setEmail('recruiter@skillshift.com');
                  setPassword('password123');
                  if (!loginUser('recruiter@skillshift.com', 'password123')) setError('Invalid credentials.');
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Recruiter: <strong>recruiter@skillshift.com</strong></span>
                <span style={{ color: 'var(--text-tertiary)' }}>pwd: password123</span>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
           <button className="btn-outline" style={{ border: 'none', fontSize: '0.75rem', opacity: 0.7 }} onClick={() => onNavigate('landing')}>
             &larr; Back to Home
           </button>
        </div>

      </div>
    </div>
  );
};
