"use client";

import { motion } from "framer-motion";
import { Search, Building2, Users, BookOpen, Activity, History } from "lucide-react";
import { FadeIn } from "./shared";

const Features = () => {
  const features = [
    {
      icon: Search,
      emoji: "🔍",
      title: "Real-Time Scraping",
      desc: "Automated data collection from parliamentofnepal.gov.np — every bill status change captured as it happens.",
    },
    {
      icon: History,
      emoji: "📜",
      title: "Full Status History",
      desc: "Every status change recorded with precise timestamps, source attribution, and audit trail.",
    },
    {
      icon: Building2,
      emoji: "🏛️",
      title: "Both Houses",
      desc: "Unified view for bills from Pratinidhi Sabha & Rastriya Sabha in a single dashboard.",
    },
    {
      icon: Users,
      emoji: "📊",
      title: "Committee Tracking",
      desc: "Know exactly which committee reviewed which bill, with amendment records and voting details.",
    },
    {
      icon: BookOpen,
      emoji: "📰",
      title: "Gazette Integration",
      desc: "Direct linkage to authenticated acts published on rajpatra.dop.gov.np.",
    },
    {
      icon: Activity,
      emoji: "🔔",
      title: "Bill Lifecycle",
      desc: "Visualize the entire journey from initial registration to gazette publication in one timeline.",
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-background relative">
      <div className="container mx-auto px-4 md:px-6">
        <FadeIn className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">
            Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Powerful Legislative Tracking
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Built for journalists, researchers, civil society, and citizens who
            need reliable, real-time parliamentary data.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="h-full p-6 md:p-8 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 group cursor-default"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                    <span className="group-hover:hidden">{f.emoji}</span>
                    <f.icon className="w-6 h-6 text-primary-foreground hidden group-hover:block" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
