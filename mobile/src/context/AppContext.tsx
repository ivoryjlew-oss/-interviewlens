import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getItem, setItem, getApiKey, SK } from '../storage/storage';
import { AI_PROVIDERS } from '../constants/providers';
import { AI_PERSONAS, Persona } from '../constants/personas';
import { FONT_PRESETS, SIZE_PRESETS, FontPreset, SizePreset, DEFAULT_FONT_ID, DEFAULT_SIZE_ID } from '../constants/fonts';
import { MoodType } from '../constants/moods';

export interface ProfileFile {
  name: string;
  content: string;
  dataUrl?: string;
}

export interface Profile {
  name: string;
  title: string;
  summary: string;
  strengths: string;
  background: string;
  personality: string;
  files: ProfileFile[];
  astroFiles: ProfileFile[];
  extra: {
    mbti: string;
    bigfive: string;
    lifepath: string;
    expression: string;
    soulurge: string;
    destiny: string;
    'numerology-notes': string;
    sun: string;
    moon: string;
    rising: string;
    mercury: string;
    venus: string;
    mars: string;
    'astro-notes': string;
  };
}

export interface Script {
  id: string;
  name: string;
  text: string;
  jobTitle?: string;
  company?: string;
  jobDesc?: string;
  context?: string;
  personaId?: string;
  fontId?: string;
  sizeId?: string;
  speed?: number;
  savedAt?: string;
}

export interface QAItem {
  q: string;
  a: string;
  index: number;
}

export interface MoodItem {
  mood: MoodType;
  confidence: number;
}

export interface Session {
  id: string;
  company: string;
  role: string;
  date: string;
  startTime: string;
  qa: QAItem[];
  moodHistory: MoodItem[];
  persona: string;
  personaLabel: string;
  overallMood: string;
  context: string;
}

export interface Prefs {
  fontId: string;
  sizeId: string;
  personaId: string;
  speed: number;
  jobTitle: string;
  company: string;
  jobDesc: string;
  context: string;
  savedAt: string;
  activeScriptId: string;
}

export interface AppState {
  // Loading
  isLoaded: boolean;

  // Onboarding
  isOnboarded: boolean;
  providerId: string;
  model: string;
  hasApiKey: boolean;

  // PIN
  pinEnabled: boolean;
  pinUnlocked: boolean;

  // Prefs
  fontPreset: FontPreset;
  sizePreset: SizePreset;
  persona: Persona;
  speed: number;

  // Scripts
  scripts: Script[];
  activeScriptId: string;

  // Script Builder state
  jobTitle: string;
  company: string;
  jobDesc: string;
  genOutput: string;
  genLoading: boolean;
  builderFiles: ProfileFile[];

  // Live Q&A state
  qaHistory: QAItem[];
  qaLoading: boolean;
  qaContext: string;
  currentMood: MoodItem | null;
  moodHistory: MoodItem[];
  sessionStart: string;
  isLive: boolean;

  // Sessions
  sessions: Record<string, Session[]>;

  // Profile
  profile: Profile;
}

const defaultProfile: Profile = {
  name: '', title: '', summary: '', strengths: '', background: '', personality: '',
  files: [], astroFiles: [],
  extra: { mbti: '', bigfive: '', lifepath: '', expression: '', soulurge: '', destiny: '', 'numerology-notes': '', sun: '', moon: '', rising: '', mercury: '', venus: '', mars: '', 'astro-notes': '' },
};

const defaultState: AppState = {
  isLoaded: false,
  isOnboarded: false,
  providerId: 'anthropic',
  model: '',
  hasApiKey: false,
  pinEnabled: false,
  pinUnlocked: false,
  fontPreset: FONT_PRESETS.find((f) => f.id === DEFAULT_FONT_ID)!,
  sizePreset: SIZE_PRESETS.find((s) => s.id === DEFAULT_SIZE_ID)!,
  persona: AI_PERSONAS[0],
  speed: 1.5,
  scripts: [],
  activeScriptId: '',
  jobTitle: '',
  company: '',
  jobDesc: '',
  genOutput: '',
  genLoading: false,
  builderFiles: [],
  qaHistory: [],
  qaLoading: false,
  qaContext: '',
  currentMood: null,
  moodHistory: [],
  sessionStart: '',
  isLive: false,
  sessions: {},
  profile: defaultProfile,
};

type Action =
  | { type: 'LOADED'; payload: Partial<AppState> }
  | { type: 'SET_ONBOARDED'; payload: { providerId: string; model: string } }
  | { type: 'SET_PROVIDER'; payload: { providerId: string; model: string; hasApiKey: boolean } }
  | { type: 'SET_HAS_API_KEY'; payload: boolean }
  | { type: 'SET_PIN_ENABLED'; payload: boolean }
  | { type: 'SET_PIN_UNLOCKED'; payload: boolean }
  | { type: 'SET_FONT'; payload: FontPreset }
  | { type: 'SET_SIZE'; payload: SizePreset }
  | { type: 'SET_PERSONA'; payload: Persona }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SET_SCRIPTS'; payload: Script[] }
  | { type: 'SET_ACTIVE_SCRIPT'; payload: string }
  | { type: 'SET_JOB_TITLE'; payload: string }
  | { type: 'SET_COMPANY'; payload: string }
  | { type: 'SET_JOB_DESC'; payload: string }
  | { type: 'SET_GEN_OUTPUT'; payload: string }
  | { type: 'SET_GEN_LOADING'; payload: boolean }
  | { type: 'SET_BUILDER_FILES'; payload: ProfileFile[] }
  | { type: 'SET_QA_HISTORY'; payload: QAItem[] }
  | { type: 'SET_QA_LOADING'; payload: boolean }
  | { type: 'SET_QA_CONTEXT'; payload: string }
  | { type: 'SET_CURRENT_MOOD'; payload: MoodItem }
  | { type: 'SET_MOOD_HISTORY'; payload: MoodItem[] }
  | { type: 'SET_SESSION_START'; payload: string }
  | { type: 'SET_IS_LIVE'; payload: boolean }
  | { type: 'SET_SESSIONS'; payload: Record<string, Session[]> }
  | { type: 'SET_PROFILE'; payload: Profile };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOADED': return { ...state, ...action.payload, isLoaded: true };
    case 'SET_ONBOARDED': return { ...state, isOnboarded: true, providerId: action.payload.providerId, model: action.payload.model, hasApiKey: true };
    case 'SET_PROVIDER': return { ...state, providerId: action.payload.providerId, model: action.payload.model, hasApiKey: action.payload.hasApiKey };
    case 'SET_HAS_API_KEY': return { ...state, hasApiKey: action.payload };
    case 'SET_PIN_ENABLED': return { ...state, pinEnabled: action.payload };
    case 'SET_PIN_UNLOCKED': return { ...state, pinUnlocked: action.payload };
    case 'SET_FONT': return { ...state, fontPreset: action.payload };
    case 'SET_SIZE': return { ...state, sizePreset: action.payload };
    case 'SET_PERSONA': return { ...state, persona: action.payload };
    case 'SET_SPEED': return { ...state, speed: action.payload };
    case 'SET_SCRIPTS': return { ...state, scripts: action.payload };
    case 'SET_ACTIVE_SCRIPT': return { ...state, activeScriptId: action.payload };
    case 'SET_JOB_TITLE': return { ...state, jobTitle: action.payload };
    case 'SET_COMPANY': return { ...state, company: action.payload };
    case 'SET_JOB_DESC': return { ...state, jobDesc: action.payload };
    case 'SET_GEN_OUTPUT': return { ...state, genOutput: action.payload };
    case 'SET_GEN_LOADING': return { ...state, genLoading: action.payload };
    case 'SET_BUILDER_FILES': return { ...state, builderFiles: action.payload };
    case 'SET_QA_HISTORY': return { ...state, qaHistory: action.payload };
    case 'SET_QA_LOADING': return { ...state, qaLoading: action.payload };
    case 'SET_QA_CONTEXT': return { ...state, qaContext: action.payload };
    case 'SET_CURRENT_MOOD': return { ...state, currentMood: action.payload };
    case 'SET_MOOD_HISTORY': return { ...state, moodHistory: action.payload };
    case 'SET_SESSION_START': return { ...state, sessionStart: action.payload };
    case 'SET_IS_LIVE': return { ...state, isLive: action.payload };
    case 'SET_SESSIONS': return { ...state, sessions: action.payload };
    case 'SET_PROFILE': return { ...state, profile: action.payload };
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  saveScripts: (scripts: Script[]) => Promise<void>;
  saveSessions: (sessions: Record<string, Session[]>) => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
  savePrefs: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    loadInitialState();
  }, []);

  async function loadInitialState() {
    const [onboarded, providerId, model, prefs, scripts, sessions, profile, pin] = await Promise.all([
      getItem<boolean>(SK.onboarded),
      getItem<string>(SK.provider),
      getItem<string>(SK.model),
      getItem<Prefs>(SK.prefs),
      getItem<Script[]>(SK.scripts),
      getItem<Record<string, Session[]>>(SK.sessions),
      getItem<Profile>(SK.profile),
      getItem<string>(SK.pin),
    ]);

    const activeProviderId = providerId ?? 'anthropic';
    const activeProvider = AI_PROVIDERS.find((p) => p.id === activeProviderId) ?? AI_PROVIDERS[0];
    const hasApiKey = activeProvider.local || !!(await getApiKey(activeProviderId));

    const fontId = prefs?.fontId ?? DEFAULT_FONT_ID;
    const sizeId = prefs?.sizeId ?? DEFAULT_SIZE_ID;
    const personaId = prefs?.personaId ?? 'coach';

    dispatch({
      type: 'LOADED',
      payload: {
        isOnboarded: !!onboarded,
        providerId: activeProviderId,
        model: model ?? activeProvider.defaultModel,
        hasApiKey,
        pinEnabled: !!pin,
        pinUnlocked: !pin,
        fontPreset: FONT_PRESETS.find((f) => f.id === fontId) ?? FONT_PRESETS[2],
        sizePreset: SIZE_PRESETS.find((s) => s.id === sizeId) ?? SIZE_PRESETS[1],
        persona: AI_PERSONAS.find((p) => p.id === personaId) ?? AI_PERSONAS[0],
        speed: prefs?.speed ?? 1.5,
        scripts: scripts ?? [],
        activeScriptId: prefs?.activeScriptId ?? '',
        jobTitle: prefs?.jobTitle ?? '',
        company: prefs?.company ?? '',
        jobDesc: prefs?.jobDesc ?? '',
        qaContext: prefs?.context ?? '',
        sessions: sessions ?? {},
        profile: profile ?? defaultProfile,
      },
    });
  }

  async function saveScripts(scripts: Script[]) {
    await setItem(SK.scripts, scripts);
    dispatch({ type: 'SET_SCRIPTS', payload: scripts });
  }

  async function saveSessions(sessions: Record<string, Session[]>) {
    await setItem(SK.sessions, sessions);
    dispatch({ type: 'SET_SESSIONS', payload: sessions });
  }

  async function saveProfile(profile: Profile) {
    await setItem(SK.profile, profile);
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }

  async function savePrefs() {
    const prefs: Prefs = {
      fontId: state.fontPreset.id,
      sizeId: state.sizePreset.id,
      personaId: state.persona.id,
      speed: state.speed,
      jobTitle: state.jobTitle,
      company: state.company,
      jobDesc: state.jobDesc,
      context: state.qaContext,
      savedAt: new Date().toISOString(),
      activeScriptId: state.activeScriptId,
    };
    await setItem(SK.prefs, prefs);
  }

  return (
    <AppContext.Provider value={{ state, dispatch, saveScripts, saveSessions, saveProfile, savePrefs }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
