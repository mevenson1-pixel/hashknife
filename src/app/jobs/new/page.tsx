"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JOB_STATUSES, JOB_STATUS_LABELS } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  jobNumber: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  clientId: z.string().min(1, "Select a client"),
  status: z.string(),
  siteAddress: z.string().optional(),
  description: z.string().optional(),
  estimatedStartDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
  estimatedBudget: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Client = { id: string; name: string };

export default function NewJobPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "LEAD" },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/jobs/next-number").then((r) => r.json()),
    ]).then(([clientsData, { jobNumber }]) => {
      setClients(clientsData);
      setValue("jobNumber", jobNumber);
    });
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create job");
      const job = await res.json();
      router.push(`/jobs/${job.id}`);
    } catch (e) {
      setError("Failed to create job. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </button>

      <h1 className="text-2xl font-bold mb-6">New Job</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobNumber">Job Number</Label>
                <Input id="jobNumber" {...register("jobNumber")} className="mt-1 font-mono" />
                {errors.jobNumber && (
                  <p className="text-xs text-destructive mt-1">{errors.jobNumber.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select<string>
                  defaultValue="LEAD"
                  onValueChange={(v) => setValue("status", v ?? "LEAD")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {JOB_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" {...register("title")} className="mt-1" placeholder="e.g. Full Backyard Renovation" />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientId">Client *</Label>
              <Select<string> onValueChange={(v) => setValue("clientId", v ?? "")}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-xs text-destructive mt-1">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="siteAddress">Site Address</Label>
              <Input id="siteAddress" {...register("siteAddress")} className="mt-1" placeholder="Job site address" />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                className="mt-1"
                rows={3}
                placeholder="Describe the scope of work..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule & Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedStartDate">Est. Start Date</Label>
                <Input
                  id="estimatedStartDate"
                  type="date"
                  {...register("estimatedStartDate")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="estimatedEndDate">Est. End Date</Label>
                <Input
                  id="estimatedEndDate"
                  type="date"
                  {...register("estimatedEndDate")}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="estimatedBudget">Estimated Budget ($)</Label>
              <Input
                id="estimatedBudget"
                type="number"
                step="0.01"
                {...register("estimatedBudget")}
                className="mt-1"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                className="mt-1"
                rows={2}
                placeholder="Any additional notes..."
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Job"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
