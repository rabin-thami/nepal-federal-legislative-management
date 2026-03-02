"use client";

import { AnimatedNumber, FadeIn, type StatsData } from "./shared";

const Stats = ({ stats: apiStats }: { stats: StatsData | null }) => {
  const stats = [
    { value: apiStats?.total ?? 0, suffix: "+", label: "Bills Tracked" },
    { value: 6, suffix: "", label: "Legislative Phases" },
    { value: 2, suffix: "", label: "Houses of Parliament" },
    {
      value: apiStats?.gazettePublished ?? 0,
      suffix: "+",
      label: "Gazette Published",
    },
  ];

  return (
    <section
      id="about"
      className="py-20 md:py-28 bg-secondary relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-0 pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-3">
            Impact at a Glance
          </h2>
          <p className="text-secondary-foreground/60 max-w-lg mx-auto">
            Bringing accountability and transparency to Nepal&apos;s legislative
            process.
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="text-center p-6 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-3">
                  <AnimatedNumber
                    value={s.value}
                    suffix={s.suffix}
                    duration={2}
                  />
                </h3>
                <p className="text-secondary-foreground/60 uppercase tracking-widest text-xs md:text-sm font-semibold">
                  {s.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
