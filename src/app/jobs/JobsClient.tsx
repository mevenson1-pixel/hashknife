"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JobStatus,
} from "@/lib/types";
import { Search, Plus, LayoutGrid, List, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

type Job = {
  id: string;
  jobNumber: string;
  title: string;
  siteAddress: string | null;
  status: JobStatus;
  estimatedStartDate: string | null;
  estimatedEndDate: string | null;
  estimatedBudget: number | null;
  updatedAt: string;
  client: { id: string; name: string };
  _count: { changeOrders: number; jobNotes: number };
};

const PIPELINE_COLUMNS: JobStatus[] = [
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

function formatCurrency(amount: number | null) {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-mono mb-0.5">
                {job.jobNumber}
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {job.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {job.client.name}
              </p>
            </div>
            <JobStatusBadge status={job.status} />
          </div>
          {(job.estimatedBudget || job.estimatedEndDate) && (
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              {job.estimatedBudget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(job.estimatedBudget)}
                </span>
              )}
              {job.estimatedEndDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(job.estimatedEndDate), "MM/dd/yy")}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function JobsClient() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "board">("board");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const jobsByStatus = PIPELINE_COLUMNS.reduce<Record<string, Job[]>>(
    (acc, status) => {
      acc[status] = jobs.filter((j) => j.status === status);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
        <div>
          <h1 className="text-xl font-bold text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${jobs.length} total jobs`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="pl-9 w-56"
            />
          </div>
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setView("board")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                view === "board"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>
          <Button onClick={() => router.push("/jobs/new")} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Job
          </Button>
        </div>
      </div>

      {/* Board view */}
      {view === "board" && (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-6 min-w-max h-full">
            {PIPELINE_COLUMNS.map((status) => {
              const colors = JOB_STATUS_COLORS[status];
              const columnJobs = jobsByStatus[status] || [];
              return (
                <div key={status} className="flex flex-col w-60 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${colors.bg} border ${colors.border}`}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {JOB_STATUS_LABELS[status]}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {columnJobs.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    {columnJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                    {columnJobs.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-border p-4 text-center">
                        <p className="text-xs text-muted-foreground">No jobs</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28">
                    Job #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Budget
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => (
                  <tr
                    key={job.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${
                      i % 2 === 0 ? "bg-card" : "bg-background"
                    }`}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {job.jobNumber}
                    </td>
                    <td className="px-4 py-3 font-medium">{job.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.client.name}
                    </td>
                    <td className="px-4 py-3">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatCurrency(job.estimatedBudget)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {job.estimatedEndDate
                        ? format(new Date(job.estimatedEndDate), "MM/dd/yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No jobs found.{" "}
                      <Link
                        href="/jobs/new"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Create one
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
