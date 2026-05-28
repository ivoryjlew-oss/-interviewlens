export type MoodType = 'positive' | 'neutral' | 'skeptical' | 'engaged' | 'disengaged' | 'pressuring';

export interface MoodConfig {
  color: string;
  icon: string;
  label: string;
}

export const MOOD_CFG: Record<MoodType, MoodConfig> = {
  positive:   { color: '#3dd68c', icon: '😊', label: 'Positive' },
  neutral:    { color: '#5b8eff', icon: '😐', label: 'Neutral' },
  skeptical:  { color: '#f0a050', icon: '🤔', label: 'Skeptical' },
  engaged:    { color: '#b47eff', icon: '⚡', label: 'Engaged' },
  disengaged: { color: '#6b7280', icon: '😶', label: 'Disengaged' },
  pressuring: { color: '#ff5f57', icon: '🔥', label: 'Pressuring' },
};

export const COMPLETION_PHRASES = [
  "that's all the questions",
  "we're all done",
  "that concludes",
  "thank you for your time",
  "we'll be in touch",
  "end of interview",
  "no more questions",
  "that wraps up",
  "we'll reach out",
  "thanks for coming in",
  "great speaking with you today",
];

export const QUESTION_TYPES = [
  { id: 'intro',      label: 'Tell me about yourself' },
  { id: 'strengths',  label: 'Greatest strengths' },
  { id: 'weaknesses', label: 'Weaknesses' },
  { id: 'whyrole',   label: 'Why this role?' },
  { id: 'whycompany', label: 'Why this company?' },
  { id: 'challenge',  label: 'Challenge at work' },
  { id: 'salary',     label: 'Salary requirements' },
  { id: 'fiveyears',  label: '5-year vision' },
  { id: 'mistake',    label: 'Time you made a mistake' },
  { id: 'leaving',    label: 'Why leaving current job?' },
  { id: 'priority',   label: 'How you prioritize work' },
  { id: 'company',    label: 'What you know about company' },
  { id: 'motivation', label: 'Full "Why this company?"' },
  { id: 'closing',    label: 'Closing statement' },
  { id: 'full',       label: 'Full interview script' },
];
