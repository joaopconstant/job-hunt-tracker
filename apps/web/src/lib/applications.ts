export const STATUSES = ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"] as const;

export type ApplicationStatus = (typeof STATUSES)[number];

export interface Application {
  id: string;
  company: string;
  role: string;
  url: string | null;
  location: string | null;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export function groupByStatus(applications: Application[]) {
  const columns = Object.fromEntries(STATUSES.map((status) => [status, [] as Application[]]));
  for (const application of applications) columns[application.status].push(application);
  return columns as Record<ApplicationStatus, Application[]>;
}
