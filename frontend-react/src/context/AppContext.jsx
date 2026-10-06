import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockCandidatePresets, mockBatchCandidates, mockUsersDb } from '../data/mockData';

const AppContext = createContext();

const DB_KEY_USERS = 'skillshift_users_db_v4';
const DB_KEY_AUTH = 'skillshift_auth_session_v3';
const DB_KEY_STUDENT_MATCH = 'skillshift_student_match_v3';
const DB_KEY_RECRUITER = 'skillshift_recruiter_state_v3';

export const AppProvider = ({ children }) => {
  // Local Database: Users Table
  const [usersDb, setUsersDb] = useState(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockUsersDb;
  });

  // Current Authentication Session
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_AUTH);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isAuthenticated: false,
      userId: null, 
    };
  });

  // Student Matcher State
  const [studentResume, setStudentResume] = useState(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_STUDENT_MATCH);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: mockCandidatePresets[0].name,
      resumeText: mockCandidatePresets[0].resumeText,
      targetRole: mockCandidatePresets[0].targetJobTitle,
      selectedPresetId: mockCandidatePresets[0].id,
      uploadedFile: null,
      result: {
        score_before_adaptation: mockCandidatePresets[0].scores.stale,
        score_after_adaptation: mockCandidatePresets[0].scores.adapted,
        missing_skills_flagged: mockCandidatePresets[0].flaggedSkills,
        recognized_baseline: mockCandidatePresets[0].recognizedBaseline,
        true_missing: mockCandidatePresets[0].trueMissing || [],
        explanation: mockCandidatePresets[0].explanation,
        dimensions: mockCandidatePresets[0].dimensions,
        isLive: false
      }
    };
  });

  // Recruiter Dashboard State
  const [recruiterCohort, setRecruiterCohort] = useState(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_RECRUITER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      targetRole: 'Machine Learning Engineer',
      candidates: mockBatchCandidates,
      uploadedFiles: [],
      metrics: {
        totalScreened: 8,
        falseNegativesRecovered: 3,
        falseNegativeRate: '37.5%',
        averageAdaptationGain: '+44.6%'
      }
    };
  });

  // Database sync effects
  useEffect(() => localStorage.setItem(DB_KEY_USERS, JSON.stringify(usersDb)), [usersDb]);
  useEffect(() => localStorage.setItem(DB_KEY_AUTH, JSON.stringify(auth)), [auth]);
  useEffect(() => localStorage.setItem(DB_KEY_STUDENT_MATCH, JSON.stringify(studentResume)), [studentResume]);
  useEffect(() => localStorage.setItem(DB_KEY_RECRUITER, JSON.stringify(recruiterCohort)), [recruiterCohort]);

  // Derived Active User State
  const activeUser = usersDb.find(u => u.id === auth.userId) || null;

  // Authentication Methods
  const registerUser = (userData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      verifiedSkills: [], // Hard proof
      certificates: [],
      githubLinked: false,
      githubUrl: '',
      applications: [],
      ...userData 
      // Expected from form: name, email, password, role, education, claimedSkills
    };
    setUsersDb(prev => [...prev, newUser]);
    setAuth({ isAuthenticated: true, userId: newUser.id });
  };

  const loginUser = (email, password) => {
    const user = usersDb.find(u => u.email === email && u.password === password);
    if (user) {
      setAuth({ isAuthenticated: true, userId: user.id });
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setAuth({ isAuthenticated: false, userId: null });
  };

  const updateUserProfile = (userId, updates) => {
    setUsersDb(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  // Job Application Logic (Pushes to Recruiter Portal)
  const applyToJob = (company) => {
    if (!activeUser) return;
    
    // Add to user's applied list
    const applicationRecord = {
      id: `app_${Date.now()}`,
      companyId: company.id,
      companyName: company.name,
      role: company.roleTitle,
      date: new Date().toISOString(),
      status: 'Applied'
    };
    updateUserProfile(activeUser.id, { applications: [...activeUser.applications, applicationRecord] });

    // Calculate Trust Points based on User Profile
    const claimedCount = activeUser.claimedSkills?.length || 0;
    const verifiedCount = activeUser.verifiedSkills?.length || 0;
    const totalSkills = Math.max(claimedCount, 1);
    
    // Trust score out of 100 based on verification ratio, boosted by Github
    let trustScore = Math.round((verifiedCount / totalSkills) * 85);
    if (activeUser.githubLinked) trustScore += 15;
    if (trustScore > 99) trustScore = 99;

    // Push into Recruiter's candidate list
    const newApplicant = {
      id: `cand-${Date.now()}`,
      name: activeUser.name,
      title: 'SkillShift Applicant',
      resumeSnippet: `Education: ${activeUser.education}. Applied via SkillShift.`,
      resume_text: `Education: ${activeUser.education}. Skills: ${activeUser.claimedSkills?.join(', ')}.`,
      legacyAtsScore: 0.15, // Low legacy ATS because modern format
      adaptedModelScore: 0.88 + (verifiedCount * 0.02), // High adapted score
      legacyRank: recruiterCohort.candidates.length + 1,
      adaptedRank: 2,
      rankShift: recruiterCohort.candidates.length - 1,
      flaggedSkills: company.emergingSkills.slice(0, 2),
      matchNotes: `Direct application to ${company.roleTitle}. Evaluated using real-time skill matching.`,
      verdict: 'Incoming Application 📩',
      verdictType: 'cyan',
      isVerified: activeUser.verifiedSkills?.length > 0 || activeUser.githubLinked,
      verifiedSkills: activeUser.verifiedSkills || [],
      claimedSkills: activeUser.claimedSkills || [],
      trustPoints: trustScore
    };

    setRecruiterCohort(prev => ({
      ...prev,
      candidates: [newApplicant, ...prev.candidates]
    }));
  };

  return (
    <AppContext.Provider value={{ 
      auth,
      activeUser,
      registerUser,
      loginUser,
      logoutUser,
      updateUserProfile,
      applyToJob,

      studentResume, 
      setStudentResume, 
      
      recruiterCohort, 
      setRecruiterCohort
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
