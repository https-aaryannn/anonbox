import { Confession } from "../types";

// --- MOCK DATABASE IMPLEMENTATION ---
// In a real app, you would uncomment the Firebase code below and remove this localStorage logic.
// This ensures the app is reviewable and functional immediately without credential setup.

const STORAGE_KEY = 'anonbox_confessions';

export const getConfessions = async (): Promise<Confession[]> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 600)); 
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const submitConfession = async (content: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 800));
  const confessions = await getConfessions();
  const newConfession: Confession = {
    id: crypto.randomUUID(),
    content,
    createdAt: Date.now(),
    isRead: false,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newConfession, ...confessions]));
};

export const updateConfession = async (id: string, updates: Partial<Confession>): Promise<void> => {
  const confessions = await getConfessions();
  const updated = confessions.map(c => c.id === id ? { ...c, ...updates } : c);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteConfession = async (id: string): Promise<void> => {
  const confessions = await getConfessions();
  const filtered = confessions.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const seedDatabase = async () => {
  const seeds: Confession[] = [
    {
      id: '1',
      content: "I secretly water my neighbor's plants when they are on vacation because I saw them dying. They think they have a green thumb now.",
      createdAt: Date.now() - 10000000,
      isRead: true,
      aiAnalysis: {
        sentimentScore: 8,
        tags: ["Kindness", "Neighbors", "Secret"],
        summary: "User secretly helps neighbor with plants.",
        riskFlag: false
      }
    },
    {
      id: '2',
      content: "I feel incredibly lonely in this big city. Everyone seems so busy and connected, but I haven't spoken to a real person in days.",
      createdAt: Date.now() - 5000000,
      isRead: false,
    },
    {
      id: '3',
      content: "I ate the last piece of cake and blamed it on the dog. I have no regrets.",
      createdAt: Date.now() - 200000,
      isRead: false,
    }
  ];
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
  }
};
