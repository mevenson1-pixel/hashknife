import { cn } from "@/lib/utils";
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, JobStatus } from "@/lib/types";

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const colors = JOB_STATUS_COLORS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
