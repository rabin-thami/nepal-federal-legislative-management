import {
  ExternalLink,
  FileText,
  CheckCircle2,
  Circle,
  Clock,
  Bot,
  ShieldAlert,
  TrendingUp,
  Scale,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import {
  formatBillStatus,
  formatHouse,
  formatCategory,
  formatBillType,
  getStatusColor,
} from "@/lib/types";
import type { BillWithDetails } from "@/lib/types";
import Link from "next/link";

// ─── Roadmap config ────────────────────────────────────────────────────────────

type PhaseStep = {
  status: string;
  label: string;
};

type Phase = {
  phase: number;
  title: string;
  steps: PhaseStep[];
};

const ROADMAP: Phase[] = [
  {
    phase: 2,
    title: "Introduction",
    steps: [
      { status: "registered", label: "Registered" },
      { status: "first_reading", label: "First Reading" },
      { status: "general_discussion", label: "General Discussion" },
      { status: "amendment_window", label: "Amendment Window" },
    ],
  },
  {
    phase: 3,
    title: "Committee Scrutiny",
    steps: [
      { status: "committee_review", label: "Committee Review" },
      { status: "clause_voting", label: "Clause Voting" },
      { status: "first_house_passed", label: "First House Passed" },
    ],
  },
  {
    phase: 4,
    title: "Second House",
    steps: [
      { status: "second_house", label: "Second House" },
      { status: "joint_sitting", label: "Joint Sitting" },
    ],
  },
  {
    phase: 5,
    title: "Authentication",
    steps: [
      { status: "speaker_certification", label: "Speaker Certification" },
      { status: "assented", label: "Presidential Assent" },
      { status: "gazette_published", label: "Gazette Published" },
    ],
  },
  {
    phase: 6,
    title: "Post-Implementation",
    steps: [{ status: "amendment_or_repeal", label: "Amendment / Repeal" }],
  },
];

// Flattened ordered list used for "past / current / future" logic
const ORDERED_STATUSES = ROADMAP.flatMap((p) => p.steps.map((s) => s.status));

function getStepState(
  stepStatus: string,
  currentStatus: string | null,
): "done" | "current" | "upcoming" {
  if (!currentStatus) return "upcoming";
  const currentIdx = ORDERED_STATUSES.indexOf(currentStatus);
  const stepIdx = ORDERED_STATUSES.indexOf(stepStatus);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StepIcon({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done")
    return (
      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
    );
  if (state === "current")
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-60" />
        <span className="relative flex h-3.5 w-3.5 rounded-full bg-primary" />
      </span>
    );
  return <Circle className="h-5 w-5 text-border shrink-0" />;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 ">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function BillDetail({ bill }: { bill: BillWithDetails }) {
  const currentStatus = bill.currentStatus;
  const statusClass = getStatusColor(currentStatus);
  const showAiReview = process.env.NEXT_PUBLIC_FEATURE_AI_REVIEW === "true";
  const showComments = process.env.NEXT_PUBLIC_FEATURE_COMMENTS === "true";

  return (
    <div className="grid grid-cols-2 grid-cols-[1fr_.5fr] gap-4 items-start">
      {/* ── Hero header ── */}
      <div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 ">
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-mono text-muted-foreground">
                  {bill.registrationNo}
                  {bill.year ? ` · ${bill.year} BS` : ""}
                  {bill.session ? ` · Session ${bill.session}` : ""}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {bill.house && (
                    <span className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
                      {formatHouse(bill.house)}
                    </span>
                  )}
                  {currentStatus && (
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClass}`}
                    >
                      {formatBillStatus(currentStatus)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {bill.parliamentUrl && (
              <a
                href={bill.parliamentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Parliament source
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          {/* Title */}
          {(bill.titleNp || bill.titleEn) && (
            <div>
              {bill.titleNp && (
                <h1 className="text-xl font-bold leading-snug text-foreground font-mukta">
                  {bill.titleNp}
                </h1>
              )}
              {bill.titleEn && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {bill.titleEn}
                </p>
              )}
            </div>
          )}
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 pt-2 border-t border-border/40">
            <InfoRow label="House" value={formatHouse(bill.house)} />
            <InfoRow label="Category" value={formatCategory(bill.category)} />
            <InfoRow label="Type" value={formatBillType(bill.billType)} />
            <InfoRow label="Presenter" value={bill.presenter} />
            <InfoRow label="Ministry" value={bill.ministry} />
            <InfoRow label="Registered (BS)" value={bill.registeredDateBs} />
            {bill.authenticatedDateBs && (
              <InfoRow
                label="Authenticated (BS)"
                value={bill.authenticatedDateBs}
              />
            )}
          </div>
          {/* Document links */}
          {(bill.registeredBillUrl || bill.authenticatedBillUrl) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {bill.registeredBillUrl && (
                <Link
                  href={bill.registeredBillUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Registered Bill PDF
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              {bill.authenticatedBillUrl && (
                <Link
                  href={bill.authenticatedBillUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:border-emerald-500/60 dark:border-emerald-700/30 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:border-emerald-500/50 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Authenticated Bill PDF
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── AI Review ── */}
        {showAiReview && (
          <div className="mt-4 rounded-2xl border border-border/60 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-foreground">
                AI Review
              </h2>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest rounded-full border border-yellow-500/50 bg-yellow-400/10 px-2.5 py-0.5 text-yellow-600 dark:border-yellow-700/40 dark:bg-yellow-950/40 dark:text-yellow-400">
                Pending Analysis
              </span>
            </div>

            {/* Risk indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground/70">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Political Risk
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">
                    Moderate
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/50">
                  Analysis pending
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground/70">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Fiscal Impact
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-border" />
                  <span className="text-xs font-semibold text-muted-foreground/50">
                    Unknown
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/50">
                  Analysis pending
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground/70">
                  <Scale className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Complexity
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-border" />
                  <span className="text-xs font-semibold text-muted-foreground/50">
                    Unknown
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/50">
                  Analysis pending
                </p>
              </div>
            </div>

            {/* Summary placeholder */}
            <div className="rounded-xl border border-dashed border-border/40 bg-secondary/10 px-4 py-5 text-center space-y-1">
              <Bot className="mx-auto h-6 w-6 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground/50">
                AI summary not yet available for this bill.
              </p>
              <p className="text-[10px] text-muted-foreground/30">
                Analysis runs automatically after bill data is ingested.
              </p>
            </div>
          </div>
        )}

        {/* ── Comments ── */}
        {showComments && (
          <div className="mt-4 rounded-2xl border border-border/60 bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-foreground">
                Comments
              </h2>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
                0 comments
              </span>
            </div>

            {/* Comment input */}
            <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border/50">
                  <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                </span>
                <textarea
                  rows={3}
                  placeholder="Share your analysis or thoughts on this bill…"
                  className="flex-1 resize-none rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post Comment
                </button>
              </div>
            </div>

            {/* Empty state */}
            <div className="rounded-xl border border-dashed border-border/40 bg-secondary/10 px-4 py-6 text-center space-y-1">
              <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground/50">
                No comments yet. Be the first to share your thoughts.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Legislative Roadmap ── */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Legislative Roadmap
        </h2>

        <div className="space-y-3">
          {ROADMAP.map((phase) => {
            const phaseStatuses = phase.steps.map((s) => s.status);
            const currentIdx = currentStatus
              ? ORDERED_STATUSES.indexOf(currentStatus)
              : -1;
            const phaseFirstIdx = ORDERED_STATUSES.indexOf(phaseStatuses[0]);
            const phaseLastIdx = ORDERED_STATUSES.indexOf(
              phaseStatuses[phaseStatuses.length - 1],
            );

            const phaseState =
              currentIdx > phaseLastIdx
                ? "done"
                : currentIdx >= phaseFirstIdx
                  ? "active"
                  : "upcoming";

            return (
              <div
                key={phase.phase}
                className={[
                  "rounded-xl border p-4 transition-colors",
                  phaseState === "done"
                    ? "border-emerald-600/30 bg-emerald-500/8 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                    : phaseState === "active"
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/40 bg-card/50",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={[
                      "text-[10px] font-bold uppercase tracking-widest",
                      phaseState === "done"
                        ? "text-emerald-600 dark:text-emerald-500"
                        : phaseState === "active"
                          ? "text-primary"
                          : "text-muted-foreground/50",
                    ].join(" ")}
                  >
                    Phase {phase.phase}
                  </span>
                  <span
                    className={[
                      "text-sm font-semibold",
                      phaseState === "done"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : phaseState === "active"
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                    ].join(" ")}
                  >
                    {phase.title}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {phase.steps.map((step, idx) => {
                    const state = getStepState(
                      step.status,
                      currentStatus ?? null,
                    );
                    // Find history entry for this status
                    const histEntry = bill.statusHistory.find(
                      (h) => h.status === step.status,
                    );

                    return (
                      <div
                        key={step.status}
                        className="flex items-center gap-1"
                      >
                        <div className="flex flex-col items-center gap-1 group/step">
                          <div className="flex items-center gap-1.5">
                            <StepIcon state={state} />
                            <span
                              className={[
                                "text-xs font-medium",
                                state === "done"
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : state === "current"
                                    ? "text-foreground font-semibold"
                                    : "text-muted-foreground/50",
                              ].join(" ")}
                            >
                              {step.label}
                            </span>
                          </div>
                          {histEntry?.statusDateBs && (
                            <span className="text-[10px] text-muted-foreground/60 pl-6.5">
                              {histEntry.statusDateBs}
                            </span>
                          )}
                        </div>
                        {idx < phase.steps.length - 1 && (
                          <span className="mx-1 text-border">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── Status History ── */}
          {bill.statusHistory.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Status History
              </h2>
              <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40 overflow-hidden">
                {bill.statusHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <Clock className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/50" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(entry.status)}`}
                        >
                          {formatBillStatus(entry.status)}
                        </span>
                        {entry.rawStatus && (
                          <span className="text-xs text-muted-foreground italic truncate">
                            &ldquo;{entry.rawStatus}&rdquo;
                          </span>
                        )}
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground/60 font-mono tabular-nums">
                      {entry.statusDateBs ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Committee Assignments ── */}
          {bill.committeeAssignments.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Committee Assignments
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {bill.committeeAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-border/60 bg-card p-4 space-y-1.5"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {a.committee?.nameNp ??
                        a.committee?.nameEn ??
                        "Committee"}
                    </p>
                    {a.committee?.nameEn && a.committee?.nameNp && (
                      <p className="text-xs text-muted-foreground">
                        {a.committee.nameEn}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-1">
                      {a.assignedDateBs && (
                        <span>Assigned: {a.assignedDateBs}</span>
                      )}
                      {a.reportSubmittedDateBs && (
                        <span>Report: {a.reportSubmittedDateBs}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
