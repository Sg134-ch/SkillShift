import re

with open('src/components/Profile.jsx', 'r') as f:
    content = f.read()

# Add states for Edit Profile and Add Skill
state_injections = """
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEducation, setEditEducation] = useState('');
  
  const [newSkill, setNewSkill] = useState('');
"""
content = content.replace("  const [uploadedFileName, setUploadedFileName] = useState('');", "  const [uploadedFileName, setUploadedFileName] = useState('');" + state_injections)

# Add Handlers
handlers = """
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
    // Optionally also unverify skills that were verified by github?
    // For now just disconnect.
    updateUserProfile(activeUser.id, {
      githubLinked: false,
      githubUrl: ''
    });
  };
"""

content = content.replace("  const handleUploadCertificate = (e) => {", handlers + "\n  const handleUploadCertificate = (e) => {")

# Update Personal Details Card to have an Edit Button
details_card_old = """<h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--accent-indigo)" /> Personal Details
            </h3>"""

details_card_new = """<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
            </div>"""

content = content.replace(details_card_old, details_card_new)


# Update Skills Card to have Add Skill form
skills_header_old = """<h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Skills & Verification Status
            </h3>"""

skills_header_new = """<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
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
            </div>"""

content = content.replace(skills_header_old, skills_header_new)

# Update GitHub Integration to have Disconnect
github_old = """<span className="badge badge-emerald">Verified</span>"""
github_new = """<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge badge-emerald">Verified</span>
                  <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }} onClick={handleDisconnectGithub}>Disconnect</button>
                </div>"""
content = content.replace(github_old, github_new)

# Add Job Applications section below Skills
applications_section = """
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
"""

content = content.replace("</div>\n\n        {/* Right Column", applications_section + "</div>\n\n        {/* Right Column")

# Add Edit Profile Modal at the end
edit_modal = """
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
"""
content = content.replace("    </div>\n  );\n};", edit_modal + "    </div>\n  );\n};")

with open('src/components/Profile.jsx', 'w') as f:
    f.write(content)

print("Profile.jsx updated successfully!")
