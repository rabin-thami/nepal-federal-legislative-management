"use client";

import Link from "next/link";
import {
  Building2,
  Github,
  Mail,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="bg-primary p-1.5 rounded-lg">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-foreground">
                  Vidhan<span className="text-primary">.</span>
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                  Legislative Tracker
                </span>
              </div>
            </div>
            <p className="max-w-md mb-6 text-sm leading-relaxed text-muted-foreground">
              An open-source initiative to bring transparency to Nepal&apos;s
              legislative process. Tracking digital democracy, one bill at a
              time. Built with data from the Parliament of Nepal and Nepal
              Gazette.
            </p>
            <div className="flex gap-3">
              {[Github, Mail, ExternalLink].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-muted-foreground"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-5 text-sm uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Parliament Tracker",
                "Gazette Search",
                "API Documentation",
                "Open Data",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-5 text-sm uppercase tracking-wider">
              Community
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "About Us",
                "GitHub Repository",
                "Contributing Guide",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="font-mono">
            &copy; 2082 BS • Nepal Federal Legislative Management System
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              Built for civic transparency in Nepal 🇳🇵
            </span>
            <span className="px-2.5 py-1 bg-muted rounded-md font-medium">
              CC0 Open Data
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
