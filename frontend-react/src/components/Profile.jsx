import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GitBranch, Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { verifyGithubSkills } from '../services/api';

export const Profile = () => {
  const { activeUser, updateUserProfile } = useApp();
  
  const [showCertModal, setShowCertModal] = useState(false);
  const [certSkill, setCertSkill] = useState('');
  const [courseName, setCourseName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');

  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [githubScanning, setGithubScanning] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEducation, setEditEducation] = useState('');
  
  const [newSkill, setNewSkill] = useState('');


  if (!activeUser) return null;

  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) return;
    setGithubScanning(true);
    
    try {
      const result = await verifyGithubSkills(githubUrl, activeUser.claimedSkills || []);
      const newVerified = Array.from(new Set([
        ...(activeUser.verifiedSkills || []), 
        ...(result?.verified_skills || [])
      ]));
      
      updateUserProfile(activeUser.id, { 
        githubLinked: true, 
        githubUrl: githubUrl,
        verifiedSkills: newVerified
      });
    } catch (err) {
      console.error("Failed to verify Github:", err);
    } finally {
      setGithubScanning(false);
      setShowGithubModal(false);
    }
  };


  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(activeUser.id, {
      name: editName,
      education: editEducation
    });
    setShowEditModal(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill && !activeUser.claimedSkills?.includes(newSkill)) {
      updateUserProfile(activeUser.id, {
        claimedSkills: [...(activeUser.claimedSkills || []), newSkill]
      });
      setNewSkill('');
    }
  };

  const handleDisconnectGithub = () => {
    // Keep only skills that are verified via certificates
    const certSkills = (activeUser.certificates || []).map(c => c.skill);
    const newVerified = (activeUser.verifiedSkills || []).filter(s => certSkills.includes(s));
    
    updateUserProfile(activeUser.id, {
      githubLinked: false,
      githubUrl: '',
      verifiedSkills: newVerified
    });
  };

  const handleUploadCertificate = (e) => {
    e.preventDefault();
    if (!certSkill || !courseName || !issuer) return;

    const newCert = {
      id: `cert_${Date.now()}`,
      skill: certSkill,
      courseName,
      issuer,
      date
    };

    const newVerified = [...(activeUser.verifiedSkills || [])];
    if (!newVerified.includes(certSkill)) {
      newVerified.push(certSkill);
    }

    updateUserProfile(activeUser.id, {
      certificates: [...(activeUser.certificates || []), newCert],
      verifiedSkills: newVerified
    });
    
    setShowCertModal(false);
    setCertSkill('');
    setCourseName('');
    setIssuer('');
    setDate('');
    setUploadedFileName('');
  };

  const claimed = activeUser.claimedSkills || [];
  const verified = activeUser.verifiedSkills || [];
  
  // All unique skills to display
  const allSkills = Array.from(new Set([...claimed, ...verified]));

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>My Profile</h1>
          <p style={{ fontSize: '1.125rem' }}>Manage your education, skills, and verifications.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        
        {/* Left Column: Skills & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FileText size={20} color="var(--accent-indigo)" /> Personal Details
              </h3>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => {
                setEditName(activeUser.name || '');
                setEditEducation(activeUser.education || '');
                setShowEditModal(true);
              }}>
                Edit Profile
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{activeUser.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{activeUser.email}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Education</div>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{activeUser.education || 'Not provided'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                Skills & Verification Status
              </h3>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)} 
                  placeholder="New skill..." 
                  style={{ padding: '6px 12px', fontSize: '0.875rem', width: '150px' }}
                />
                <button type="submit" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem' }}>Add</button>
              </form>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {allSkills.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No skills added yet.</div>}
              {allSkills.map(skill => {
                const isVerified = verified.includes(skill);
                return (
                  <div key={skill} style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${isVerified ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                    background: isVerified ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{skill}</span>
                    {isVerified ? (
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    ) : (
                      <AlertCircle size={16} color="var(--accent-amber)" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        
          <div className="card">
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Job Applications
            </h3>
            {(!activeUser.applications || activeUser.applications.length === 0) ? (
              <div style={{ color: 'var(--text-muted)' }}>You haven't applied to any jobs yet. Head to the Job Board!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeUser.applications.map(app => (
                  <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{app.role}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{app.companyName}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className={`badge ${app.status === 'Accepted' ? 'badge-emerald' : app.status === 'Rejected' ? 'badge-red' : 'badge-amber'}`}>
                        {app.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{new Date(app.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
</div>

        {/* Right Column: Integrations & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
            <h4 style={{ marginBottom: '16px' }}>Integrations</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GitBranch size={24} color={activeUser.githubLinked ? 'var(--text-primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 600 }}>GitHub</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {activeUser.githubLinked ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
              </div>
              {!activeUser.githubLinked ? (
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setShowGithubModal(true)}>
                  Connect
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge badge-emerald">Verified</span>
                  <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }} onClick={handleDisconnectGithub}>Disconnect</button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '16px' }}>Manual Verification</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Upload a course certificate to officially verify a skill and boost your Trust Points for recruiters.
            </p>
            <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setShowCertModal(true)}>
              <Upload size={16} /> Upload Certificate
            </button>
          </div>

          {activeUser.certificates && activeUser.certificates.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom: '16px' }}>Uploaded Certificates</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeUser.certificates.map(c => (
                  <div key={c.id} style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-canvas)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.courseName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.issuer} • {c.date}</div>
                    <div className="badge badge-emerald" style={{ marginTop: '8px', padding: '2px 6px', fontSize: '0.625rem' }}>Verified: {c.skill}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Certificate Upload Modal */}
      {showCertModal && (
        <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '8px' }}>Upload Course Certificate</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Fill in the details to verify a specific skill on your profile.</p>
            
            <form onSubmit={handleUploadCertificate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>Skill to Verify *</label>
                <select style={{ width: '100%' }} value={certSkill} onChange={e => setCertSkill(e.target.value)} required>
                  <option value="">Select a claimed skill...</option>
                  {claimed.filter(s => !verified.includes(s)).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {claimed.filter(s => !verified.includes(s)).length === 0 && (
                    <option disabled>All claimed skills are verified!</option>
                  )}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>Course Name *</label>
                <input type="text" style={{ width: '100%' }} value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Advanced Machine Learning" required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>Issuer / Organization *</label>
                <input type="text" style={{ width: '100%' }} value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="e.g. Coursera" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>Completion Date</label>
                <input type="month" style={{ width: '100%' }} value={date} onChange={e => setDate(e.target.value)} />
              </div>

              <div style={{ position: 'relative', marginTop: '16px', padding: '16px', border: '2px dashed var(--border-strong)', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-canvas)' }}>
                <input 
                  type="file" 
                  onChange={(e) => setUploadedFileName(e.target.files[0]?.name || '')}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  required 
                />
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                  {uploadedFileName ? uploadedFileName : 'Click to browse or drag PDF/Image here'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowCertModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* GitHub Connect Modal */}
      {showGithubModal && (
        <div className="modal-overlay" onClick={() => setShowGithubModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '8px' }}>Connect GitHub Profile</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Provide your GitHub URL to scan public repositories for technical skill verification.</p>
            
            <form onSubmit={handleGithubSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>GitHub URL *</label>
                <input 
                  type="url" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} 
                  value={githubUrl} 
                  onChange={e => setGithubUrl(e.target.value)} 
                  placeholder="https://github.com/username" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowGithubModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={githubScanning}>
                  {githubScanning ? 'Scanning...' : 'Connect & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '8px' }}>Edit Profile</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Update your personal information.</p>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>Full Name</label>
                <input type="text" style={{ width: '100%' }} value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8125rem', fontWeight: 600 }}>Education</label>
                <input type="text" style={{ width: '100%' }} value={editEducation} onChange={e => setEditEducation(e.target.value)} placeholder="e.g. M.S. Computer Science" />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
