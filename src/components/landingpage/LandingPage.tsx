"use client";

import { useState, useEffect } from "react";
import { type Bill } from "@/lib/types";
import { type StatsData, type BillWithHistory } from "./shared";

import Navbar from "./Navbar";
import Hero from "./Hero";
import LiveTicker from "./Status-Ticker";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import BillExplorerMock from "./BillExplorerMock";
import Stats from "./Stats";
import Footer from "./Footer";

/* ─── Data fetching hooks ─── */
function useStats() {
  const [data, setData] = useState<StatsData | null>(null);
  useEffect(() => {
    fetch("/api/bills/stats")
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch(() => {});
  }, []);
  return data;
}

function useRecentBills(limit = 10) {
  const [data, setData] = useState<Bill[]>([]);
  useEffect(() => {
    fetch(`/api/bills?limit=${limit}&sort=newest`)
      .then((r) => r.json())
      .then((json) => setData(json.data ?? []))
      .catch(() => {});
  }, [limit]);
  return data;
}

function useFeaturedBill() {
  const [data, setData] = useState<BillWithHistory | null>(null);
  useEffect(() => {
    fetch("/api/bills?limit=1&sort=newest")
      .then((r) => r.json())
      .then((json) => {
        const bill = json.data?.[0];
        if (bill?.id)
          return fetch(`/api/bills/${bill.id}`).then((r) => r.json());
        return null;
      })
      .then((json) => {
        if (json?.data) setData(json.data);
      })
      .catch(() => {});
  }, []);
  return data;
}

/* ─── Main landing page (client shell) ─── */
export default function LandingPage() {
  const stats = useStats();
  const recentBills = useRecentBills(10);
  const featuredBill = useFeaturedBill();

  return (
    <div className="min-h-screen bg-background text-foreground font-inter selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <Hero stats={stats} />
      <LiveTicker bills={recentBills} />
      <Features />
      <HowItWorks />
      <BillExplorerMock featuredBill={featuredBill} />
      <Stats stats={stats} />
      <Footer />
    </div>
  );
}
