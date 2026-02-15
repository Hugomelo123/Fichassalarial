import Navbar from "@/components/Navbar";
import CompanyForm from "@/components/CompanyForm";
import EmployeeForm from "@/components/EmployeeForm";
import SalaryBreakdown from "@/components/SalaryBreakdown";
import PayslipPreview from "@/components/PayslipPreview";
import AnnualSummary from "@/components/AnnualSummary";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* ─── Left panel: inputs ─── */}
          <aside className="space-y-1 lg:col-span-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm space-y-6">
              <CompanyForm />

              <div className="h-px bg-slate-100" />

              <EmployeeForm />
            </div>

            {/* Breakdown */}
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Decomposition
              </h3>
              <SalaryBreakdown />
            </div>
          </aside>

          {/* ─── Right panel: preview ─── */}
          <section className="space-y-4 lg:col-span-8">
            <PayslipPreview />
            <AnnualSummary />
          </section>
        </div>
      </main>
    </div>
  );
}
