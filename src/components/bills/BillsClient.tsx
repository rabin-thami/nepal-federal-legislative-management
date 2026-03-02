"use client";

import { useState, useCallback, useDeferredValue } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useBills } from "@/lib/hooks/use-bills";
import {
  formatBillStatus,
  formatHouseShort,
  getStatusColor,
} from "@/lib/types";
import type { BillFilters } from "@/lib/hooks/use-bills";
import type { Bill } from "@/lib/types";

const PAGE_SIZE = 25;

const HOUSE_OPTIONS = [
  { value: "", label: "All Houses" },
  { value: "pratinidhi_sabha", label: "House of Representatives" },
  { value: "rastriya_sabha", label: "National Assembly" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "registered", label: "Registered" },
  { value: "first_reading", label: "First Reading" },
  { value: "general_discussion", label: "General Discussion" },
  { value: "amendment_window", label: "Amendment Window" },
  { value: "committee_review", label: "Committee Review" },
  { value: "clause_voting", label: "Clause Voting" },
  { value: "first_house_passed", label: "First House Passed" },
  { value: "second_house", label: "Second House" },
  { value: "joint_sitting", label: "Joint Sitting" },
  { value: "speaker_certification", label: "Speaker Certification" },
  { value: "assented", label: "Assented" },
  { value: "gazette_published", label: "Gazette Published" },
  { value: "amendment_or_repeal", label: "Amendment / Repeal" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "governmental", label: "Governmental" },
  { value: "non_governmental", label: "Non-governmental" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "status", label: "By status" },
];

function BillCard({ bill }: { bill: Bill }) {
  const statusClass = getStatusColor(bill.currentStatus);

  return (
    <Link
      href={`/bills/${bill.id}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all duration-150 hover:border-primary/40 hover:shadow-md hover:shadow-black/20 cursor-pointer"
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 rounded-md bg-primary/10 p-1.5 text-primary">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-mono text-muted-foreground truncate">
            {bill.registrationNo}
            {bill.year ? ` · ${bill.year} BS` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {bill.house && (
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              {formatHouseShort(bill.house)}
            </span>
          )}
          {bill.currentStatus && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
            >
              {formatBillStatus(bill.currentStatus)}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="min-w-0 font-mukta">
        {bill.titleNp && (
          <p className="text-md font-semibold text-foreground leading-snug line-clamp-2">
            {bill.titleNp}
          </p>
        )}
        {bill.titleEn && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 font-inter">
            {bill.titleEn}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-mukta">
        {bill.presenter && (
          <span className="truncate max-w-[180px] text-md">
            👤 {bill.presenter}
          </span>
        )}
        {bill.ministry && (
          <span className="truncate max-w-[200px]">🏛 {bill.ministry}</span>
        )}
        {bill.registeredDateBs && (
          <span className="shrink-0 font-inter">
            📅 {bill.registeredDateBs}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-auto">
        {bill.parliamentUrl ? (
          <a
            href={bill.parliamentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Parliament source
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
          View details
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-9 w-full appearance-none rounded-lg border border-border/60 bg-card px-3 pr-7 text-xs font-medium text-foreground shadow-none outline-none ring-0 transition-colors hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/30 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.854a.75.75 0 111.08 1.04l-4.25 4.41a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
}

export function BillsClient() {
  const [search, setSearch] = useState("");
  const [house, setHouse] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "status">("newest");
  const [page, setPage] = useState(0);

  const deferredSearch = useDeferredValue(search);

  const hasFilters = !!(deferredSearch || house || status || category);

  const filters: BillFilters = {
    search: deferredSearch || undefined,
    house: house || undefined,
    status: status || undefined,
    category: category || undefined,
    sort,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isPending, isFetching, isError, error } = useBills(filters);

  const bills = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const resetFilters = useCallback(() => {
    setSearch("");
    setHouse("");
    setStatus("");
    setCategory("");
    setSort("newest");
    setPage(0);
  }, []);

  const goToPage = (p: number) =>
    setPage(Math.max(0, Math.min(p, totalPages - 1)));

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or registration number…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="h-10 w-full rounded-lg border border-border/60 bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none ring-0 transition-colors hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          {isFetching && !isPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 flex-1">
            <SelectFilter
              value={house}
              onChange={(v) => {
                setHouse(v);
                setPage(0);
              }}
              options={HOUSE_OPTIONS}
              label="House"
            />
            <SelectFilter
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(0);
              }}
              options={STATUS_OPTIONS}
              label="Status"
            />
            <SelectFilter
              value={category}
              onChange={(v) => {
                setCategory(v);
                setPage(0);
              }}
              options={CATEGORY_OPTIONS}
              label="Category"
            />
            <SelectFilter
              value={sort}
              onChange={(v) => {
                setSort(v as typeof sort);
                setPage(0);
              }}
              options={SORT_OPTIONS}
              label="Sort"
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-3 h-9 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {isPending ? (
            "Loading…"
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {total.toLocaleString()}
              </span>{" "}
              bill{total !== 1 ? "s" : ""} found
              {totalPages > 1 && (
                <>
                  {" "}
                  · page {page + 1} of {totalPages}
                </>
              )}
            </>
          )}
        </span>
      </div>

      {/* Bills list */}
      {isPending ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-card py-16 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-sm">Loading bills…</span>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load bills."}
        </div>
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-card py-16 text-muted-foreground">
          <FileText className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">No bills match your search.</p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-1 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p =
                totalPages <= 7
                  ? i
                  : page < 4
                    ? i
                    : page > totalPages - 5
                      ? totalPages - 7 + i
                      : page - 3 + i;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  ].join(" ")}
                >
                  {p + 1}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
