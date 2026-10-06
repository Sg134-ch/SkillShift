import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User, Briefcase, Zap } from 'lucide-react';

const Login = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState(null); // 'student' | 'recruiter'
  const [name, setName] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedRole) return;
    
    login({
      name: name.trim(),
      role: selectedRole
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-app)'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'var(--gradient-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)',
            margin: '0 auto 20px'
          }}>
            <Zap size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Welcome to Skill<span className="gradient-text">Shift</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Identify skill drift, verify credentials, and connect talent with future-proof roles.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select your portal</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <button 
                type="button"
                onClick={() => setSelectedRole('student')}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '20px',
                  borderRadius: '12px',
                  background: selectedRole === 'student' ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-surface-elevated)',
                  border: selectedRole === 'student' ? '2px solid var(--accent-cyan)' : '2px solid var(--border-subtle)',
                  color: selectedRole === 'student' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <User size={28} />
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Candidate</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setSelectedRole('recruiter')}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '20px',
                  borderRadius: '12px',
                  background: selectedRole === 'recruiter' ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-surface-elevated)',
                  border: selectedRole === 'recruiter' ? '2px solid var(--accent-purple)' : '2px solid var(--border-subtle)',
                  color: selectedRole === 'recruiter' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Briefcase size={28} />
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Recruiter</span>
              </button>

            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Full Name</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="e.g. Sarah Cheulkar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '12px 16px', fontSize: '1rem' }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!name.trim() || !selectedRole}
            style={{ 
              padding: '14px', 
              fontSize: '1rem', 
              fontWeight: 600, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px',
              opacity: (!name.trim() || !selectedRole) ? 0.5 : 1
            }}
          >
            <ShieldCheck size={20} />
            Secure Login
          </button>
          
        </form>

      </div>
    </div>
  );
};

export default Login;
