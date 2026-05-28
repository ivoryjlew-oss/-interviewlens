export interface FontPreset {
  id: string;
  label: string;
  family: string;
  desc: string;
}

export interface SizePreset {
  id: string;
  label: string;
  size: number;
}

export const FONT_PRESETS: FontPreset[] = [
  { id: 'atkinson', label: 'Atkinson', family: 'AtkinsonHyperlegible', desc: 'Dyslexia-friendly' },
  { id: 'lexend', label: 'Lexend', family: 'Lexend', desc: 'Reduces visual stress' },
  { id: 'inter', label: 'Inter', family: 'Inter', desc: 'Neutral, ultra-legible' },
  { id: 'dmsans', label: 'DM Sans', family: 'DMSans', desc: 'Clean modern sans' },
  { id: 'mono', label: 'Mono', family: 'DMSansMono', desc: 'High-contrast mono' },
];

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'sm', label: 'S', size: 18 },
  { id: 'md', label: 'M', size: 24 },
  { id: 'lg', label: 'L', size: 30 },
  { id: 'xl', label: 'XL', size: 38 },
];

export const DEFAULT_FONT_ID = 'inter';
export const DEFAULT_SIZE_ID = 'md';
