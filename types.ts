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

export interface User {
  uid: string;
  email: string | null;
}

export type ApiKeyStatus = {
  hasKey: boolean;
  createdAt: number | null;
  lastUsedAt: number | null;
  /** Masked preview of the key hash shown when the raw key is no longer available. */
  preview: string | null;
};

export type ApiKeyResult =
  | { ok: true; key: string }
  | { ok: false; error: string };

export type Route =
  | { name: 'landing' }
  | { name: 'login' }
  | { name: 'dashboard' }
  | { name: 'public'; ownerUid: string };
