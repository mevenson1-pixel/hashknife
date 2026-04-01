"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { JobStatus } from "@/lib/types";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Save,
  X,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";

type Job = {
  id: string;
  jobNumber: string;
  title: string;
  status: JobStatus;
  estimatedBudget: number | null;
  updatedAt: string;
  _count: { changeOrders: number };
};

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  jobs: Job[];
};

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) { router.push("/clients"); return; }
    const data = await res.json();
    setClient(data);
    setForm({
      name: data.name,
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      notes: data.notes || "",
    });
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const handleSave = async () => {
    await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditing(false);
    fetchClient();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this client? All associated jobs must be deleted first.")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/clients");
  };

  if (loading || !client) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  const formatCurrency = (n: number | null) =>
    n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border bg-card">
        <Link
          href="/clients"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> All Clients
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              {client.phone && (
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{client.phone}</span>
              )}
              {client.email && (
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{client.email}</span>
              )}
              {client.address && (
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{client.address}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8 max-w-3xl">
        {/* Edit form */}
        {editing && (
          <div className="rounded-lg border border-border p-5 bg-card space-y-4">
            <p className="font-semibold text-sm">Edit Client</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Name</Label>
                <Input className="mt-1" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input className="mt-1" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea className="mt-1" rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="h-3.5 w-3.5 mr-1" /> Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
            </div>
          </div>
        )}

        {/* Notes */}
        {client.notes && !editing && (
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}

        {/* Jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Jobs ({client.jobs.length})
            </p>
            <Button size="sm" variant="outline" onClick={() => router.push("/jobs/new")}>
              New Job
            </Button>
          </div>
          <div className="space-y-2">
            {client.jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="rounded-lg border border-border bg-card p-4 hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{job.jobNumber}</p>
                      <p className="font-medium text-sm mt-0.5">{job.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.estimatedBudget && (
                        <p className="text-sm text-muted-foreground">{formatCurrency(job.estimatedBudget)}</p>
                      )}
                      <JobStatusBadge status={job.status} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {client.jobs.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No jobs yet.</p>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="border-t border-border pt-6">
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDelete}>
            Delete Client
          </Button>
        </div>
      </div>
    </div>
  );
}
