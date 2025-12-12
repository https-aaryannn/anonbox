export interface Confession {
  id: string;
  content: string;
  createdAt: number; // Timestamp
  isRead: boolean;
  archived?: boolean;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  sentimentScore: number; // 0 to 10
  tags: string[];
  summary: string;
  riskFlag: boolean; // True if content is concerning
}

export enum AppView {
  SUBMIT = 'SUBMIT',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  uid: string;
  email: string | null;
}
