export const LIMITS = {
  FREE: {
    documents: 20,
    analyses: 30,
    chatMessages: 100,
  },
  PRO: {
    documents: 200,
    analyses: 300,
    chatMessages: 1000,
  },
} as const;

export function getUserLimits(plan: string) {
  return LIMITS[plan as keyof typeof LIMITS] || LIMITS.FREE;
}