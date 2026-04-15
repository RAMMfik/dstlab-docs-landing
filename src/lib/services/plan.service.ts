export type UserPlan = "START" | "PRO";
export type SubscriptionStatus =
  | "INACTIVE"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export type BillingProvider = "NONE" | "MANUAL" | "ALFAPAY";

type PlanConfig = {
  code: UserPlan;
  title: string;
  marketingTitle: string;
  description: string;
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
  START: {
    code: "START",
    title: "Start",
    marketingTitle: "Start",
    description: "Для знакомства с сервисом и базовой работы с документами.",
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
      billingPortal: true,
      storageDriver: "local",
    },
  },
  PRO: {
    code: "PRO",
    title: "Pro",
    marketingTitle: "Pro",
    description: "Для регулярной работы с документами и расширенного AI-анализа.",
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
      billingPortal: true,
      storageDriver: "s3-ready",
    },
  },
};

export function normalizePlan(plan: string): UserPlan {
  return plan === "PRO" ? "PRO" : "START";
}

export function normalizeSubscriptionStatus(status: string): SubscriptionStatus {
  if (
    status === "ACTIVE" ||
    status === "PAST_DUE" ||
    status === "CANCELED" ||
    status === "EXPIRED"
  ) {
    return status;
  }

  return "INACTIVE";
}

export function normalizeBillingProvider(provider: string): BillingProvider {
  if (provider === "MANUAL" || provider === "ALFAPAY") {
    return provider;
  }

  return "NONE";
}

export function getPlanConfig(plan: string) {
  return PLAN_CONFIG[normalizePlan(plan)];
}

export function getPlanTitle(plan: string) {
  return getPlanConfig(plan).title;
}

export function getPlanMarketingTitle(plan: string) {
  return getPlanConfig(plan).marketingTitle;
}

export function getPlanDescription(plan: string) {
  return getPlanConfig(plan).description;
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