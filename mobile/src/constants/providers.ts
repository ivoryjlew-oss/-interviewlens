export interface ModelOption {
  id: string;
  label: string;
}

export interface AIProvider {
  id: string;
  label: string;
  shortLabel: string;
  models: ModelOption[];
  apiUrl: string;
  free?: boolean;
  local?: boolean;
  defaultModel: string;
  keyPlaceholder: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'anthropic',
    label: 'Claude (Anthropic)',
    shortLabel: 'Claude',
    models: [
      { id: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
    ],
    defaultModel: 'claude-sonnet-4-5',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    keyPlaceholder: 'sk-ant-...',
  },
  {
    id: 'openai',
    label: 'OpenAI (GPT)',
    shortLabel: 'OpenAI',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
    defaultModel: 'gpt-4o',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    shortLabel: 'Gemini',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    ],
    defaultModel: 'gemini-2.0-flash',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    free: true,
    keyPlaceholder: 'AIza...',
  },
  {
    id: 'mistral',
    label: 'Mistral AI',
    shortLabel: 'Mistral',
    models: [
      { id: 'mistral-large-latest', label: 'Mistral Large' },
      { id: 'mistral-small-latest', label: 'Mistral Small' },
      { id: 'open-mistral-7b', label: 'Mistral 7B' },
    ],
    defaultModel: 'mistral-large-latest',
    apiUrl: 'https://api.mistral.ai/v1/chat/completions',
    keyPlaceholder: '...',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    shortLabel: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat' },
      { id: 'deepseek-coder', label: 'DeepSeek Coder' },
    ],
    defaultModel: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'ollama',
    label: 'Ollama (Local AI)',
    shortLabel: 'Ollama',
    models: [
      { id: 'llama3.2', label: 'Llama 3.2' },
      { id: 'llama3.1', label: 'Llama 3.1' },
      { id: 'mistral', label: 'Mistral' },
      { id: 'phi3', label: 'Phi-3' },
    ],
    defaultModel: 'llama3.2',
    apiUrl: 'http://localhost:11434/api/chat',
    local: true,
    keyPlaceholder: 'No key needed',
  },
];
