import { BillsClient } from "@/components/bills/BillsClient";

export const metadata = {
  title: "Bills — Vidhan",
  description:
    "Browse and search all bills tracked from Nepal's Federal Parliament.",
};

export default function BillsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bills
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse and search all bills tracked from Nepal&apos;s Federal
          Parliament.
        </p>
      </div>

      {/* Interactive client section: filters, list, pagination */}
      <BillsClient />
    </div>
  );
}
