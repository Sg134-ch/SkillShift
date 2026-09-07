import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockCandidatePresets, mockBatchCandidates } from '../data/mockData';

const AppContext = createContext();

const LOCAL_STORAGE_KEY_STUDENT = 'skillshift_student_state_v1';
const LOCAL_STORAGE_KEY_RECRUITER = 'skillshift_recruiter_state_v1';
const LOCAL_STORAGE_KEY_WEIGHTS = 'skillshift_dimension_weights_v1';

export const AppProvider = ({ children }) => {
  // Student State
  const [studentResume, setStudentResume] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      resumeText: mockCandidatePresets[0].resumeText,
      targetRole: 'Machine Learning Engineer',
      selectedPresetId: mockCandidatePresets[0].id,
      uploadedFile: null,
      result: {
        score_before_adaptation: mockCandidatePresets[0].scores.stale,
        score_after_adaptation: mockCandidatePresets[0].scores.adapted,
        missing_skills_flagged: mockCandidatePresets[0].flaggedSkills,
        recognized_baseline: mockCandidatePresets[0].recognizedBaseline,
        explanation: mockCandidatePresets[0].explanation,
        dimensions: mockCandidatePresets[0].dimensions,
        isLive: false
      }
    };
  });

  // Recruiter Batch State
  const [recruiterCohort, setRecruiterCohort] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RECRUITER);
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

  // Dimension Weights Customization
  const [dimensionWeights, setDimensionWeights] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_WEIGHTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      coreTechnical: 35,
      modernTooling: 40,
      domainRelevance: 25
    };
  });

  // Persist Student state
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STUDENT, JSON.stringify(studentResume));
    } catch (e) {
      console.warn("Storage sync error", e);
    }
  }, [studentResume]);

  // Persist Recruiter state
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_RECRUITER, JSON.stringify(recruiterCohort));
    } catch (e) {
      console.warn("Storage sync error", e);
    }
  }, [recruiterCohort]);

  // Persist Dimension weights
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_WEIGHTS, JSON.stringify(dimensionWeights));
    } catch (e) {
      console.warn("Storage sync error", e);
    }
  }, [dimensionWeights]);

  return (
    <AppContext.Provider value={{
      studentResume,
      setStudentResume,
      recruiterCohort,
      setRecruiterCohort,
      dimensionWeights,
      setDimensionWeights
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
