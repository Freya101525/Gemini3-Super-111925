export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ExecutionMetric {
  agentName: string;
  latency: number;
  tokens: number;
  provider: string;
  timestamp: number;
}

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  icon: string;
  textColorLight: string;
  textColorDark: string;
}

export type Language = 'zh_TW' | 'en';

export interface Translation {
  title: string;
  subtitle: string;
  themeSelector: string;
  language: string;
  darkMode: string;
  uploadTab: string;
  previewTab: string;
  configTab: string;
  executeTab: string;
  dashboardTab: string;
  notesTab: string;
  uploadPdf: string;
  startOcr: string;
  runAll: string;
  providers: string;
}