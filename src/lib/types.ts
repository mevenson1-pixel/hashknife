export type JobStatus =
  | "LEAD"
  | "ESTIMATE"
  | "CONTRACT_SIGNED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "PUNCH_LIST"
  | "COMPLETE"
  | "INVOICED"
  | "PAID";

export const JOB_STATUSES: JobStatus[] = [
  "LEAD",
  "ESTIMATE",
  "CONTRACT_SIGNED",
  "SCHEDULED",
  "IN_PROGRESS",
  "PUNCH_LIST",
  "COMPLETE",
  "INVOICED",
  "PAID",
];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  LEAD: "Lead",
  ESTIMATE: "Estimate",
  CONTRACT_SIGNED: "Contract Signed",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  PUNCH_LIST: "Punch List",
  COMPLETE: "Complete",
  INVOICED: "Invoiced",
  PAID: "Paid",
};

export const JOB_STATUS_COLORS: Record<
  JobStatus,
  { bg: string; text: string; border: string }
> = {
  LEAD: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
  },
  ESTIMATE: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  CONTRACT_SIGNED: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  SCHEDULED: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  IN_PROGRESS: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  PUNCH_LIST: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  COMPLETE: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  INVOICED: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  PAID: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
};

export type BudgetCategory =
  | "LABOR"
  | "MATERIALS"
  | "EQUIPMENT"
  | "SUBCONTRACTOR"
  | "OTHER";

export type ChangeOrderStatus = "PENDING" | "APPROVED" | "REJECTED";
