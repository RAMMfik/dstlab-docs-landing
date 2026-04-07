export function getUserLimits(plan: string) {
  if (plan === "PRO") {
    return {
      documents: 200,
      analyses: 300,
      messages: 1000,
    };
  }

  return {
    documents: 20,
    analyses: 30,
    messages: 100,
  };
}