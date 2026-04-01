"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JobStatus,
  BudgetCategory,
  ChangeOrderStatus,
} from "@/lib/types";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";

const BUDGET_CATEGORIES: BudgetCategory[] = [
  "LABOR",
  "MATERIALS",
  "EQUIPMENT",
  "SUBCONTRACTOR",
  "OTHER",
];

type BudgetItem = {
  id: string;
  category: BudgetCategory;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
};

type ChangeOrder = {
  id: string;
  coNumber: number;
  description: string;
  amount: number;
  status: ChangeOrderStatus;
  notes: string | null;
  createdAt: string;
  approvedAt: string | null;
};

type JobNote = {
  id: string;
  content: string;
  createdAt: string;
};

type ScheduleBlock = {
  id: string;
  title: string;
  start: string;
  end: string;
  notes: string | null;
};

type Job = {
  id: string;
  jobNumber: string;
  title: string;
  description: string | null;
  siteAddress: string | null;
  status: JobStatus;
  estimatedStartDate: string | null;
  actualStartDate: string | null;
  estimatedEndDate: string | null;
  actualEndDate: string | null;
  estimatedBudget: number | null;
  notes: string | null;
  updatedAt: string;
  client: { id: string; name: string; email: string | null; phone: string | null };
  budgetItems: BudgetItem[];
  changeOrders: ChangeOrder[];
  jobNotes: JobNote[];
  scheduleBlocks: ScheduleBlock[];
};

function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "MM/dd/yyyy");
}

// Status stepper
function StatusStepper({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: JobStatus;
  onStatusChange: (s: JobStatus) => void;
}) {
  const currentIdx = JOB_STATUSES.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {JOB_STATUSES.map((status, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const future = idx > currentIdx;
        return (
          <div key={status} className="flex items-center gap-1">
            <button
              onClick={() => onStatusChange(status)}
              title={`Move to ${JOB_STATUS_LABELS[status]}`}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : done
                  ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25"
                  : "bg-muted text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {JOB_STATUS_LABELS[status]}
            </button>
            {idx < JOB_STATUSES.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Budget tab
function BudgetTab({
  job,
  onRefresh,
}: {
  job: Job;
  onRefresh: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    category: "LABOR" as BudgetCategory,
    description: "",
    estimatedAmount: "",
    actualAmount: "",
  });

  const totals = job.budgetItems.reduce(
    (acc, item) => {
      acc.estimated += item.estimatedAmount;
      acc.actual += item.actualAmount;
      return acc;
    },
    { estimated: 0, actual: 0 }
  );

  const approvedCOs = job.changeOrders
    .filter((co) => co.status === "APPROVED")
    .reduce((sum, co) => sum + co.amount, 0);

  const totalBudget = (job.estimatedBudget || 0) + approvedCOs;

  const handleAdd = async () => {
    await fetch(`/api/jobs/${job.id}/budget-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setAdding(false);
    setNewItem({ category: "LABOR", description: "", estimatedAmount: "", actualAmount: "" });
    onRefresh();
  };

  const handleDelete = async (itemId: string) => {
    await fetch(`/api/jobs/${job.id}/budget-items?itemId=${itemId}`, {
      method: "DELETE",
    });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Contract Value</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(totalBudget)}</p>
            {approvedCOs > 0 && (
              <p className="text-xs text-muted-foreground">
                Incl. {formatCurrency(approvedCOs)} in COs
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Est. Cost</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(totals.estimated)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Actual Cost</p>
            <p className={`text-xl font-bold mt-1 ${totals.actual > totals.estimated ? "text-destructive" : ""}`}>
              {formatCurrency(totals.actual)}
            </p>
            {totals.estimated > 0 && (
              <p className={`text-xs ${totals.actual > totals.estimated ? "text-destructive" : "text-muted-foreground"}`}>
                {totals.actual > totals.estimated ? "+" : ""}
                {formatCurrency(totals.actual - totals.estimated)} variance
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget items table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-32">Category</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-32">Estimated</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-32">Actual</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28">Variance</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {job.budgetItems.map((item) => {
              const variance = item.actualAmount - item.estimatedAmount;
              return (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">{item.category}</span>
                  </td>
                  <td className="px-4 py-2.5">{item.description}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">{formatCurrency(item.estimatedAmount)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">{formatCurrency(item.actualAmount)}</td>
                  <td className={`px-4 py-2.5 text-right font-mono text-sm ${variance > 0 ? "text-destructive" : variance < 0 ? "text-green-600" : "text-muted-foreground"}`}>
                    {variance !== 0 ? (variance > 0 ? "+" : "") + formatCurrency(variance) : "—"}
                  </td>
                  <td className="px-2 py-2.5">
                    <button onClick={() => handleDelete(item.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Totals row */}
            {job.budgetItems.length > 0 && (
              <tr className="bg-muted/30 font-semibold border-t-2 border-border">
                <td className="px-4 py-2.5" colSpan={2}>Total</td>
                <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(totals.estimated)}</td>
                <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(totals.actual)}</td>
                <td className={`px-4 py-2.5 text-right font-mono ${totals.actual > totals.estimated ? "text-destructive" : "text-green-600"}`}>
                  {totals.actual !== totals.estimated
                    ? (totals.actual > totals.estimated ? "+" : "") + formatCurrency(totals.actual - totals.estimated)
                    : "—"}
                </td>
                <td />
              </tr>
            )}
          </tbody>
        </table>

        {/* Add row */}
        {adding ? (
          <div className="p-4 border-t border-border bg-muted/10 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <Select<string>
                defaultValue="LABOR"
                onValueChange={(v) => setNewItem((p) => ({ ...p, category: (v ?? "LABOR") as BudgetCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                className="col-span-1"
              />
              <Input
                type="number"
                placeholder="Estimated $"
                value={newItem.estimatedAmount}
                onChange={(e) => setNewItem((p) => ({ ...p, estimatedAmount: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Actual $"
                value={newItem.actualAmount}
                onChange={(e) => setNewItem((p) => ({ ...p, actualAmount: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!newItem.description}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Line Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Change Orders tab
function ChangeOrdersTab({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [newCO, setNewCO] = useState({ description: "", amount: "", notes: "" });

  const handleAdd = async () => {
    await fetch(`/api/jobs/${job.id}/change-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCO),
    });
    setAdding(false);
    setNewCO({ description: "", amount: "", notes: "" });
    onRefresh();
  };

  const handleStatusChange = async (coId: string, status: ChangeOrderStatus) => {
    await fetch(`/api/jobs/${job.id}/change-orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coId, status }),
    });
    onRefresh();
  };

  const handleDelete = async (coId: string) => {
    await fetch(`/api/jobs/${job.id}/change-orders?coId=${coId}`, { method: "DELETE" });
    onRefresh();
  };

  const totalApproved = job.changeOrders
    .filter((co) => co.status === "APPROVED")
    .reduce((sum, co) => sum + co.amount, 0);

  const totalPending = job.changeOrders
    .filter((co) => co.status === "PENDING")
    .reduce((sum, co) => sum + co.amount, 0);

  return (
    <div className="space-y-4">
      {(totalApproved > 0 || totalPending > 0) && (
        <div className="flex gap-4">
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-xs text-green-600 font-medium">Approved COs</p>
            <p className="text-lg font-bold text-green-800">{formatCurrency(totalApproved)}</p>
          </div>
          {totalPending > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-600 font-medium">Pending COs</p>
              <p className="text-lg font-bold text-amber-800">{formatCurrency(totalPending)}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {job.changeOrders.map((co) => (
          <div key={co.id} className="rounded-lg border border-border p-4 bg-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">CO-{co.coNumber}</span>
                  <COStatusBadge status={co.status} />
                </div>
                <p className="text-sm font-medium">{co.description}</p>
                {co.notes && <p className="text-xs text-muted-foreground mt-1">{co.notes}</p>}
                <p className="text-xs text-muted-foreground mt-2">
                  Added {format(new Date(co.createdAt), "MMM d, yyyy")}
                  {co.approvedAt && ` · Approved ${format(new Date(co.approvedAt), "MMM d, yyyy")}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(co.amount)}</p>
                {co.status === "PENDING" && (
                  <div className="flex gap-1.5 mt-2 justify-end">
                    <button
                      onClick={() => handleStatusChange(co.id, "APPROVED")}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" /> Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(co.id, "REJECTED")}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="h-3 w-3" /> Reject
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(co.id)}
                  className="mt-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {job.changeOrders.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground py-4">No change orders yet.</p>
        )}
      </div>

      {adding ? (
        <div className="rounded-lg border border-border p-4 bg-muted/10 space-y-3">
          <p className="text-sm font-medium">New Change Order</p>
          <Input
            placeholder="Description *"
            value={newCO.description}
            onChange={(e) => setNewCO((p) => ({ ...p, description: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Amount ($)"
            value={newCO.amount}
            onChange={(e) => setNewCO((p) => ({ ...p, amount: e.target.value }))}
          />
          <Textarea
            placeholder="Notes (optional)"
            rows={2}
            value={newCO.notes}
            onChange={(e) => setNewCO((p) => ({ ...p, notes: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newCO.description}>
              <Save className="h-3.5 w-3.5 mr-1" /> Save CO
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Change Order
        </Button>
      )}
    </div>
  );
}

function COStatusBadge({ status }: { status: ChangeOrderStatus }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status === "PENDING" && <Clock className="h-2.5 w-2.5" />}
      {status === "APPROVED" && <CheckCircle className="h-2.5 w-2.5" />}
      {status === "REJECTED" && <XCircle className="h-2.5 w-2.5" />}
      {status}
    </span>
  );
}

// Notes tab
function NotesTab({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await fetch(`/api/jobs/${job.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setContent("");
    setSaving(false);
    onRefresh();
  };

  const handleDelete = async (noteId: string) => {
    await fetch(`/api/jobs/${job.id}/notes?noteId=${noteId}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button size="sm" onClick={handleAdd} disabled={!content.trim() || saving}>
          {saving ? "Saving..." : "Add Note"}
        </Button>
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        {job.jobNotes.map((note) => (
          <div key={note.id} className="rounded-lg border border-border p-4 bg-card">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm flex-1 whitespace-pre-wrap">{note.content}</p>
              <button
                onClick={() => handleDelete(note.id)}
                className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        ))}
        {job.jobNotes.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No notes yet.</p>
        )}
      </div>
    </div>
  );
}

// Details tab (edit job info)
function DetailsTab({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: job.title,
    description: job.description || "",
    siteAddress: job.siteAddress || "",
    estimatedStartDate: job.estimatedStartDate ? job.estimatedStartDate.split("T")[0] : "",
    actualStartDate: job.actualStartDate ? job.actualStartDate.split("T")[0] : "",
    estimatedEndDate: job.estimatedEndDate ? job.estimatedEndDate.split("T")[0] : "",
    actualEndDate: job.actualEndDate ? job.actualEndDate.split("T")[0] : "",
    estimatedBudget: job.estimatedBudget?.toString() || "",
    notes: job.notes || "",
  });

  const handleSave = async () => {
    await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditing(false);
    onRefresh();
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Title</p><p>{job.title}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Site Address</p><p>{job.siteAddress || "—"}</p></div>
          <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Description</p><p className="whitespace-pre-wrap">{job.description || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Est. Start</p><p>{formatDate(job.estimatedStartDate)}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Actual Start</p><p>{formatDate(job.actualStartDate)}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Est. End</p><p>{formatDate(job.estimatedEndDate)}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Actual End</p><p>{formatDate(job.actualEndDate)}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Est. Budget</p><p>{formatCurrency(job.estimatedBudget)}</p></div>
          <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Notes</p><p className="whitespace-pre-wrap">{job.notes || "—"}</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Title</Label>
          <Input className="mt-1" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>Site Address</Label>
          <Input className="mt-1" value={form.siteAddress} onChange={(e) => setForm((p) => ({ ...p, siteAddress: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea className="mt-1" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div>
          <Label>Est. Start Date</Label>
          <Input className="mt-1" type="date" value={form.estimatedStartDate} onChange={(e) => setForm((p) => ({ ...p, estimatedStartDate: e.target.value }))} />
        </div>
        <div>
          <Label>Actual Start Date</Label>
          <Input className="mt-1" type="date" value={form.actualStartDate} onChange={(e) => setForm((p) => ({ ...p, actualStartDate: e.target.value }))} />
        </div>
        <div>
          <Label>Est. End Date</Label>
          <Input className="mt-1" type="date" value={form.estimatedEndDate} onChange={(e) => setForm((p) => ({ ...p, estimatedEndDate: e.target.value }))} />
        </div>
        <div>
          <Label>Actual End Date</Label>
          <Input className="mt-1" type="date" value={form.actualEndDate} onChange={(e) => setForm((p) => ({ ...p, actualEndDate: e.target.value }))} />
        </div>
        <div>
          <Label>Est. Budget ($)</Label>
          <Input className="mt-1" type="number" value={form.estimatedBudget} onChange={(e) => setForm((p) => ({ ...p, estimatedBudget: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea className="mt-1" rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>Save Changes</Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}

// Main component
export function JobDetailClient({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}`);
    if (!res.ok) { router.push("/jobs"); return; }
    setJob(await res.json());
    setLoading(false);
  }, [jobId, router]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const handleStatusChange = async (status: JobStatus) => {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchJob();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 rounded bg-muted animate-pulse mb-4" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border bg-card">
        <Link
          href="/jobs"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> All Jobs
        </Link>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1">{job.jobNumber}</p>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <Link href={`/clients/${job.client.id}`} className="hover:text-foreground hover:underline underline-offset-4 transition-colors">
                  {job.client.name}
                </Link>
              </span>
              {job.siteAddress && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.siteAddress}
                </span>
              )}
              {job.estimatedBudget && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  {formatCurrency(job.estimatedBudget)}
                </span>
              )}
            </div>
          </div>
          <JobStatusBadge status={job.status} className="mt-1" />
        </div>

        {/* Status stepper */}
        <StatusStepper currentStatus={job.status} onStatusChange={handleStatusChange} />
      </div>

      {/* Tabs */}
      <div className="flex-1 px-8 py-6">
        <Tabs defaultValue="details">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="budget">
              Budget
              {job.budgetItems.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5">{job.budgetItems.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="change-orders">
              Change Orders
              {job.changeOrders.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5">{job.changeOrders.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes
              {job.jobNotes.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5">{job.jobNotes.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <DetailsTab job={job} onRefresh={fetchJob} />
          </TabsContent>
          <TabsContent value="budget">
            <BudgetTab job={job} onRefresh={fetchJob} />
          </TabsContent>
          <TabsContent value="change-orders">
            <ChangeOrdersTab job={job} onRefresh={fetchJob} />
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab job={job} onRefresh={fetchJob} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
