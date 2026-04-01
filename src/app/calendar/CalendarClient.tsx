"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { JobStatus, JOB_STATUS_COLORS } from "@/lib/types";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { "en-US": enUS },
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  jobId: string;
  type: "block" | "job";
  status: JobStatus;
};

function statusToColor(status: JobStatus): string {
  const map: Record<JobStatus, string> = {
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
  return map[status] || "#64748b";
}

export function CalendarClient() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then(({ blocks, jobs }) => {
        const blockEvents: CalendarEvent[] = blocks.map((b: {
          id: string; title: string; start: string; end: string;
          job: { id: string; jobNumber: string; status: JobStatus };
        }) => ({
          id: b.id,
          title: `${b.job.jobNumber}: ${b.title}`,
          start: new Date(b.start),
          end: new Date(b.end),
          jobId: b.job.id,
          type: "block" as const,
          status: b.job.status,
        }));

        const jobEvents: CalendarEvent[] = jobs
          .filter((j: { estimatedStartDate: string | null; estimatedEndDate: string | null }) =>
            j.estimatedStartDate && j.estimatedEndDate
          )
          .map((j: {
            id: string; jobNumber: string; title: string; status: JobStatus;
            estimatedStartDate: string; estimatedEndDate: string;
            client: { name: string };
          }) => ({
            id: `job-${j.id}`,
            title: `${j.jobNumber}: ${j.title} (${j.client.name})`,
            start: new Date(j.estimatedStartDate),
            end: new Date(j.estimatedEndDate),
            jobId: j.id,
            type: "job" as const,
            status: j.status,
          }));

        setEvents([...jobEvents, ...blockEvents]);
        setLoading(false);
      });
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    const color = statusToColor(event.status);
    const isBlock = event.type === "block";
    return {
      style: {
        backgroundColor: isBlock ? color : `${color}22`,
        borderColor: color,
        borderWidth: "1px",
        borderStyle: "solid",
        color: isBlock ? "#fff" : color,
        borderRadius: "4px",
        fontSize: "11px",
        padding: "1px 4px",
      },
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
        <div>
          <h1 className="text-xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Job schedules and work blocks
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border-2 border-amber-500 bg-amber-500" />
            Schedule blocks
          </span>
          <span className="flex items-center gap-1.5 ml-2">
            <span className="inline-block h-3 w-3 rounded border-2 border-amber-500 bg-amber-100" />
            Job date range
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-6 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading schedule...</p>
          </div>
        ) : (
          <div className="h-full [&_.rbc-calendar]:h-full [&_.rbc-toolbar]:mb-4 [&_.rbc-toolbar-label]:font-semibold [&_.rbc-toolbar-label]:text-lg [&_.rbc-event]:cursor-pointer">
            <Calendar
              localizer={localizer}
              events={events}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => router.push(`/jobs/${event.jobId}`)}
              views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
              style={{ height: "100%" }}
              popup
            />
          </div>
        )}
      </div>
    </div>
  );
}
