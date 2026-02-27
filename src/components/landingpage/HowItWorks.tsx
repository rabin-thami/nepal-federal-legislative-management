"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  MessageSquare,
  PenLine,
  Users,
  Vote,
  Gavel,
  Landmark,
  Handshake,
  BadgeCheck,
  Stamp,
  BookOpenCheck,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./shared";

const steps = [
  {
    key: "registered",
    label: "Registered",
    icon: FileText,
    color: "bg-blue-500",
    phase: "Introduction",
    description:
      "Bill is formally registered and tabled in the originating house.",
  },
  {
    key: "first_reading",
    label: "First Reading",
    icon: BookOpen,
    color: "bg-blue-500",
    phase: "Introduction",
    description:
      "The bill is read out for the first time and its general principles are introduced.",
  },
  {
    key: "general_discussion",
    label: "General Discussion",
    icon: MessageSquare,
    color: "bg-blue-500",
    phase: "Introduction",
    description:
      "Members debate and discuss the bill's objectives, scope, and merits.",
  },
  {
    key: "amendment_window",
    label: "Amendment Window",
    icon: PenLine,
    color: "bg-blue-500",
    phase: "Introduction",
    description:
      "Period for members to propose amendments to the bill before committee referral.",
  },
  {
    key: "committee_review",
    label: "Committee Review",
    icon: Users,
    color: "bg-amber-500",
    phase: "Deep Scrutiny",
    description:
      "Thematic committee examines the bill clause by clause, hears experts, and proposes changes.",
  },
  {
    key: "clause_voting",
    label: "Clause-by-Clause Voting",
    icon: Vote,
    color: "bg-amber-500",
    phase: "Deep Scrutiny",
    description:
      "Each clause of the bill is individually debated and voted on by the committee.",
  },
  {
    key: "first_house_passed",
    label: "First House Passed",
    icon: Gavel,
    color: "bg-amber-500",
    phase: "Deep Scrutiny",
    description:
      "The originating house approves the bill and sends it to the second house.",
  },
  {
    key: "second_house",
    label: "Second House Review",
    icon: Landmark,
    color: "bg-purple-500",
    phase: "Second House",
    description:
      "The other house of parliament reviews, debates, and may propose amendments.",
  },
  {
    key: "joint_sitting",
    label: "Joint Sitting",
    icon: Handshake,
    color: "bg-purple-500",
    phase: "Second House",
    description:
      "If the two houses disagree, a joint sitting is convened to resolve differences.",
  },
  {
    key: "speaker_certification",
    label: "Speaker Certification",
    icon: BadgeCheck,
    color: "bg-emerald-500",
    phase: "Authentication",
    description:
      "The Speaker of the House certifies the bill as passed by parliament.",
  },
  {
    key: "assented",
    label: "Presidential Assent",
    icon: Stamp,
    color: "bg-emerald-500",
    phase: "Authentication",
    description:
      "The President of Nepal gives formal assent, turning the bill into law.",
  },
  {
    key: "gazette_published",
    label: "Gazette Published",
    icon: BookOpenCheck,
    color: "bg-emerald-500",
    phase: "Authentication",
    description:
      "The enacted law is published in the Nepal Gazette (Rajpatra) for public record.",
  },
  {
    key: "amendment_or_repeal",
    label: "Amendment / Repeal",
    icon: RefreshCw,
    color: "bg-rose-500",
    phase: "Post-Implementation",
    description:
      "The law may be amended or repealed through subsequent legislative action.",
  },
];

const phaseColors: Record<string, string> = {
  Introduction: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "Deep Scrutiny": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "Second House": "text-purple-500 bg-purple-500/10 border-purple-500/20",
  Authentication: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "Post-Implementation": "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32 bg-muted/30 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <FadeIn className="text-center mb-16 md:mb-20">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">
            The Legislative Journey
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            How Bills Become Law
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every bill follows these 13 steps through Nepal&apos;s federal
            parliament — from registration to gazette publication.
          </p>
        </FadeIn>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line desktop */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] z-0">
            <motion.div
              className="w-full bg-gradient-to-b from-blue-500 via-amber-500/60 via-purple-500/60 via-emerald-500/60 to-rose-500/40 rounded-full"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            />
          </div>
          {/* Vertical line mobile */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-[3px] z-0">
            <motion.div
              className="w-full bg-gradient-to-b from-blue-500 via-amber-500/60 via-purple-500/60 via-emerald-500/60 to-rose-500/40 rounded-full"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            />
          </div>

          <div className="relative z-10 space-y-6 md:space-y-0">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              const prevPhase = i > 0 ? steps[i - 1].phase : null;
              const isNewPhase = step.phase !== prevPhase;

              return (
                <React.Fragment key={step.key}>
                  {isNewPhase && (
                    <FadeIn delay={i * 0.04}>
                      <div className="flex justify-start md:justify-center py-2 md:py-4">
                        <span
                          className={cn(
                            "ml-14 md:ml-0 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border",
                            phaseColors[step.phase],
                          )}
                        >
                          {step.phase}
                        </span>
                      </div>
                    </FadeIn>
                  )}

                  <FadeIn
                    delay={i * 0.05}
                    direction={isLeft ? "left" : "right"}
                  >
                    {/* Mobile */}
                    <div className="md:hidden flex items-start gap-4">
                      <div className="relative z-20 flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg relative",
                            step.color,
                          )}
                        >
                          <step.icon className="w-5 h-5" />
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background text-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-current shadow-sm">
                            {i + 1}
                          </span>
                        </motion.div>
                      </div>
                      <div className="flex-1 pb-1">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                              {i + 1}/{steps.length}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-foreground mb-1">
                            {step.label}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center py-3">
                      <div className="w-[calc(50%-36px)]">
                        {isLeft && (
                          <motion.div
                            whileHover={{ y: -3 }}
                            className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all ml-auto mr-0 max-w-sm relative"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                                Step {i + 1}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {step.label}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {step.description}
                            </p>
                            <div className="absolute right-[-22px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-card border-r border-t border-border/60" />
                          </motion.div>
                        )}
                      </div>
                      <div className="relative z-20 w-[72px] flex items-center justify-center shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-background cursor-pointer relative",
                            step.color,
                          )}
                        >
                          <step.icon className="w-5 h-5" />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-background text-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-current shadow-sm">
                            {i + 1}
                          </span>
                        </motion.div>
                      </div>
                      <div className="w-[calc(50%-36px)]">
                        {!isLeft && (
                          <motion.div
                            whileHover={{ y: -3 }}
                            className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all mr-auto ml-0 max-w-sm relative"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                                Step {i + 1}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {step.label}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {step.description}
                            </p>
                            <div className="absolute left-[-22px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-card border-l border-b border-border/60" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                </React.Fragment>
              );
            })}

            <FadeIn delay={0.7}>
              <div className="flex justify-start md:justify-center pt-4">
                <div className="ml-1 md:ml-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg ring-4 ring-background"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3 font-medium">
                Law Enacted & Published
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
