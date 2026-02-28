"use client";

import { motion } from "framer-motion";
import { type Bill, formatBillStatus } from "@/lib/types";
import { timeAgo } from "./shared";

const LiveTicker = ({ bills }: { bills: Bill[] }) => {
  const tickerItems = bills.map((b) => ({
    id: `${b.year}-${b.registrationNo}`,
    action: `${formatBillStatus(b.currentStatus)} — ${b.titleNp || b.titleEn || "Bill"}`,
    time: timeAgo(b.updatedAt),
  }));

  if (tickerItems.length === 0) return null;

  // Render both copies inline — no nested component — so React doesn't complain
  const item = (prefix: string) =>
    tickerItems.map((t, i) => (
      <div
        key={`${prefix}-${i}`}
        className="flex items-center gap-3 text-sm whitespace-nowrap"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="font-mono font-bold text-primary-foreground/90">
          Bill #{t.id}
        </span>
        <span className="text-secondary-foreground/80 font-mukta">
          {t.action}
        </span>
        <span className="text-secondary-foreground/50 text-xs">• {t.time}</span>
      </div>
    ));

  return (
    <div className="bg-secondary text-secondary-foreground py-3.5 overflow-hidden relative z-20">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-10 px-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {item("a")}
        {item("b")}
      </motion.div>
    </div>
  );
};

export default LiveTicker;
