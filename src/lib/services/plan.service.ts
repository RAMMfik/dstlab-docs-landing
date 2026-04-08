export type UserPlan = "FREE" | "PRO";
export type SubscriptionStatus =
  | "INACTIVE"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED";

export type BillingProvider = "NONE" | "MANUAL" | "STRIPE";

type PlanConfig = {
  code: UserPlan;
  title: string;
  limits: {
    documents: number;
    analyses: number;
    messages: number;
    maxUploadSizeBytes: number;
  };
  features: {
    priorityAnalysis: boolean;
    teams: boolean;
    apiAccess: boolean;
    billingPortal: boolean;
    storageDriver: "local" | "s3-ready";
  };
};

export const PLAN_CONFIG: Record<UserPlan, PlanConfig> = {
  FREE: {
    code: "FREE",
    title: "FREE",
    limits: {
      documents: 20,
      analyses: 30,
      messages: 100,
      maxUploadSizeBytes: 10 * 1024 * 1024,
    },
    features: {
      priorityAnalysis: false,
      teams: false,
      apiAccess: false,
      billingPortal: false,
      storageDriver: "local",
    },
  },
  PRO: {
    code: "PRO",
    title: "PRO",
    limits: {
      documents: 200,
      analyses: 300,
      messages: 1000,
      maxUploadSizeBytes: 25 * 1024 * 1024,
    },
    features: {
      priorityAnalysis: true,
      teams: false,
      apiAccess: false,
      billingPortal: false,
      storageDriver: "s3-ready",
    },
  },
};

export function normalizePlan(plan: string): UserPlan {
  return plan === "PRO" ? "PRO" : "FREE";
}

export function normalizeSubscriptionStatus(status: string): SubscriptionStatus {
  if (
    status === "ACTIVE" ||
    status === "PAST_DUE" ||
    status === "CANCELED"
  ) {
    return status;
  }

  return "INACTIVE";
}

export function normalizeBillingProvider(provider: string): BillingProvider {
  if (provider === "MANUAL" || provider === "STRIPE") {
    return provider;
  }

  return "NONE";
}

export function getPlanConfig(plan: string) {
  return PLAN_CONFIG[normalizePlan(plan)];
}

export function getPlanFeatures(plan: string) {
  return getPlanConfig(plan).features;
}

export function getPlanLimits(plan: string) {
  return getPlanConfig(plan).limits;
}

export function isPaidPlan(plan: string) {
  return normalizePlan(plan) === "PRO";
}

export function hasPlanFeature(
  plan: string,
  feature: keyof ReturnType<typeof getPlanFeatures>
) {
  return Boolean(getPlanFeatures(plan)[feature]);
}