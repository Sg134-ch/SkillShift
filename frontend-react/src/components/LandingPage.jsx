import React from 'react';
import { Sparkles, Activity, ShieldCheck, Zap, ArrowRight, BrainCircuit, Users, Building2 } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      {/* Navbar */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'var(--gradient-primary)', borderRadius: '10px', color: '#fff' }}>
            <Sparkles size={20} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Skill<span className="gradient-text">Shift</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-secondary" onClick={() => onNavigate('login')}>Log In</button>
          <button className="btn-primary" onClick={() => onNavigate('register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative background blur */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'var(--glow-cyan)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />

        <div className="badge badge-emerald" style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          🌟 The Future of Tech Hiring is Here
        </div>
        
        <h1 style={{ fontSize: '4.5rem', fontWeight: 900, maxWidth: '900px', lineHeight: 1.1, marginBottom: '24px', color: 'var(--text-primary)', position: 'relative', zIndex: 1 }}>
          Defeat <span className="gradient-text">Concept Drift</span> in the Modern Job Market.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', marginBottom: '40px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
          Technology evolves faster than HR screening models. SkillShift uses advanced AI to detect emergent skills, ensuring <strong>Candidates</strong> get recognized for modern tech stacks and <strong>Recruiters</strong> stop missing out on top talent due to outdated keywords.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
          <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onNavigate('register')}>
            Join as a Candidate <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => onNavigate('login')}>
            <Building2 size={18} /> Recruiter Access
          </button>
        </div>
      </main>

      {/* Feature Explanations Section */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>How SkillShift Works</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              We've re-engineered the hiring pipeline to be intelligent, dynamic, and fair for the AI era.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            
            {/* Feature 1 */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-cyan)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Detect "Concept Drift"</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Legacy ATS systems penalize candidates using new tools (like Next.js or RAG) because they only look for old keywords (like jQuery). Our AI detects when a new skill replaces an old one and boosts your score accordingly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Trust Points & Verification</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Stop relying on unverified claims. Candidates can link their GitHub or upload course certificates. Verified skills generate "Trust Points" which instantly flag top-tier applicants to recruiters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <BrainCircuit size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>AI Roadmap Studio</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Not matching your dream job? Our AI Sandbox doesn't just reject you—it generates a personalized, multi-stage learning roadmap showing you exactly what emergent skills to learn next.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 48px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={16} /> SkillShift AI Analytics
        </div>
        <p>© 2026 SkillShift. Overcoming legacy ATS biases using machine learning.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
