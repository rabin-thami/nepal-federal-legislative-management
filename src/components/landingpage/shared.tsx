"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  type Bill,
  type BillStatus,
  type BillStatusHistory,
  type StatusSource,
} from "@/lib/types";

/* ─── Shared API response types ─── */
export interface StatsData {
  total: number;
  gazettePublished: number;
  awaitingAuth: number;
  inCommittee: number;
  byHouse: { pratinidhiSabha: number; rastriyaSabha: number };
  byCategory: { governmental: number; nonGovernmental: number };
  byStatus: { status: string | null; count: number }[];
  byYear: { year: string; count: number }[];
}

export interface BillWithHistory extends Bill {
  statusHistory: BillStatusHistory[];
}

/* ─── Status helpers ─── */
export const ALL_STATUSES: { key: string; label: string; phase: string }[] = [
  { key: "registered", label: "Registered", phase: "Introduction" },
  { key: "first_reading", label: "First Reading", phase: "Introduction" },
  {
    key: "general_discussion",
    label: "General Discussion",
    phase: "Introduction",
  },
  { key: "amendment_window", label: "Amendment Window", phase: "Introduction" },
  {
    key: "committee_review",
    label: "Committee Review",
    phase: "Deep Scrutiny",
  },
  { key: "clause_voting", label: "Clause Voting", phase: "Deep Scrutiny" },
  { key: "first_house_passed", label: "House Passed", phase: "Deep Scrutiny" },
  { key: "second_house", label: "Second House", phase: "Second House" },
  { key: "joint_sitting", label: "Joint Sitting", phase: "Second House" },
  {
    key: "speaker_certification",
    label: "Speaker Cert.",
    phase: "Authentication",
  },
  { key: "assented", label: "Assented", phase: "Authentication" },
  { key: "gazette_published", label: "Gazette", phase: "Authentication" },
  {
    key: "amendment_or_repeal",
    label: "Amend/Repeal",
    phase: "Post-Implementation",
  },
];

export const statusToStepIndex = (status: BillStatus | null): number => {
  if (!status) return -1;
  return ALL_STATUSES.findIndex((s) => s.key === status);
};

export const sourceDisplayName = (
  src: StatusSource | string | null,
): string => {
  const map: Record<string, string> = {
    parliament_scrape: "Parliament Scrape",
    gazette_scrape: "Gazette Scrape",
    manual_entry: "Manual Entry",
  };
  return map[src ?? ""] ?? String(src ?? "Unknown");
};

export function timeAgo(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ─── Animated Counter ─── */
export const AnimatedNumber = ({
  value,
  suffix = "",
  duration = 2,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration, ease: "easeOut" });
      const unsub = rounded.on("change", (v) => setDisplay(v));
      return () => {
        controls.stop();
        unsub();
      };
    }
  }, [isInView, value, count, rounded, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

/* ─── Fade-in wrapper ─── */
export const FadeIn = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) => {
  const dirs = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...dirs[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
