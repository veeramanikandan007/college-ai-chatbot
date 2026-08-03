import { fetchApi } from '../lib/api';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  careerObjective?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface ProjectItem {
  title: string;
  technologies: string[];
  link?: string;
  description: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  issueDate?: string;
}

export interface AchievementItem {
  title: string;
  description?: string;
}

export interface ReferenceItem {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
}

export interface ResumePayload {
  title: string;
  template: 'modern' | 'professional' | 'minimal' | 'corporate' | 'student';
  personalInfo: PersonalInfo;
  education: EducationItem[];
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: string[];
  hobbies: string[];
  references: ReferenceItem[];
}

export interface ResumeResponse {
  id: number;
  user_id: number;
  title: string;
  template: string;
  resume_data: ResumePayload;
  ats_score: number;
  grammar_score: number;
  formatting_score: number;
  missing_skills: string[];
  suggestions: string[];
  updated_at?: string;
}

export interface ATSResult {
  overall_score: number;
  grammar_score: number;
  formatting_score: number;
  missing_skills: string[];
  weak_sections: string[];
  suggestions: string[];
}

export const getResume = async (): Promise<ResumeResponse> => {
  return await fetchApi('/resume');
};

export const saveResume = async (payload: ResumePayload): Promise<ResumeResponse> => {
  return await fetchApi('/resume/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const deleteResume = async (): Promise<void> => {
  await fetchApi('/resume', { method: 'DELETE' });
};

export const enhanceResumeContent = async (
  section: string,
  content: string,
  context?: string
): Promise<string> => {
  const res = await fetchApi('/resume/enhance', {
    method: 'POST',
    body: JSON.stringify({ section, content, context }),
  });
  return res.enhanced_text;
};

export const evaluateATS = async (
  resume_data: ResumePayload,
  job_description?: string
): Promise<ATSResult> => {
  return await fetchApi('/resume/ats', {
    method: 'POST',
    body: JSON.stringify({ resume_data, job_description }),
  });
};
