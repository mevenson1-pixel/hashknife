"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { JOB_STATUSES, JOB_STATUS_LABELS, JobStatus } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Briefcase,
  TrendingUp,
  Clock,
  FileText,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

type DashboardData = {
  totalJobs: number;
  activeJobs: number;
  jobsThisMonth: number;
  totalRevenue: number;
  pendingInvoices: number;
  pipelineCounts: { status: JobStatus; count: number }[];
  upcomingBlocks: {
    id: string;
    title: string;
    start: string;
    end: string;
    job: { id: string; jobNumber: string; title: string; status: JobStatus };
  }[];
  recentJobs: {
    id: string;
    jobNumber: string;
    title: string;
    status: JobStatus;
    updatedAt: string;
    client: { name: string };
  }[];
};

const STATUS_COLORS: Record<JobStatus, string> = {
  LEAD: "#64748b",
  ESTIMATE: "#3b82f6",
  CONTRACT_SIGNED: "#6366f1",
  SCHEDULED: "#8b5cf6",
  IN_PROGRESS: "#f59e0b",
  PUNCH_LIST: "#f97316",
  COMPLETE: "#22c55e",
  INVOICED: "#14b8a6",
  PAID: "#059669",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Build pipeline chart data
  const pipelineMap = new Map(data.pipelineCounts.map((p) => [p.status, p.count]));
  const chartData = JOB_STATUSES.map((status) => ({
    status,
    label: JOB_STATUS_LABELS[status],
    count: pipelineMap.get(status) ?? 0,
  }));

  return (
    <div className="p-8 max-w-6xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-bold mt-1">{data.activeJobs}</p>
                <p className="text-xs text-muted-foreground mt-1">{data.totalJobs} total</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100">
                <Briefcase className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">New This Month</p>
                <p className="text-3xl font-bold mt-1">{data.jobsThisMonth}</p>
                <p className="text-xs text-muted-foreground mt-1">jobs created</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Revenue (Paid)</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(data.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">all time</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Pending Invoices</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(data.pendingInvoices)}</p>
                <p className="text-xs text-muted-foreground mt-1">outstanding</p>
              </div>
              <div className="p-2 rounded-lg bg-teal-100">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline chart */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-semibold mb-4">Pipeline Overview</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={28}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "#6b7280" }}
                  angle={-35}
                  textAnchor="end"
                  height={55}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  allowDecimals={false}
                  width={20}
                />
                <Tooltip
                  formatter={(value) => [value, "Jobs"]}
                  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status]}
                      opacity={entry.count === 0 ? 0.3 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming schedule */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">Upcoming (Next 7 Days)</p>
              <Link href="/calendar" className="text-xs text-primary hover:underline underline-offset-4 flex items-center gap-0.5">
                Calendar <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {data.upcomingBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No work scheduled in next 7 days</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.upcomingBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => router.push(`/jobs/${block.job.id}`)}
                  >
                    <div className="text-center w-12 shrink-0">
                      <p className="text-xs font-bold text-primary">
                        {format(new Date(block.start), "MMM")}
                      </p>
                      <p className="text-xl font-bold leading-none">
                        {format(new Date(block.start), "d")}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">{block.job.jobNumber}</p>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{block.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(block.start), "h:mm a")} – {format(new Date(block.end), "h:mm a")}
                      </p>
                    </div>
                    <JobStatusBadge status={block.job.status} className="shrink-0 ml-auto" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent jobs */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Recent Activity</p>
            <Link href="/jobs" className="text-xs text-primary hover:underline underline-offset-4 flex items-center gap-0.5">
              All Jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="flex items-center gap-4 py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-muted-foreground">{job.jobNumber}</p>
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.client.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <JobStatusBadge status={job.status} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(job.updatedAt), "MMM d")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
