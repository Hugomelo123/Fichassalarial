import Navbar from "@/components/Navbar";
import CompanyForm from "@/components/CompanyForm";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeeList from "@/components/EmployeeList";
import SalaryBreakdown from "@/components/SalaryBreakdown";
import PayslipPreview from "@/components/PayslipPreview";
import AnnualSummary from "@/components/AnnualSummary";
import PayslipHistory from "@/components/PayslipHistory";
import Dashboard from "@/components/Dashboard";
import { usePayrollStore } from "@/store/usePayrollStore";

export default function Home() {
  const { view } = usePayrollStore();

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {view === "simulator" && <SimulatorView />}
        {view === "history" && <PayslipHistory />}
        {view === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}

function SimulatorView() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ─── Left panel ─── */}
      <aside className="space-y-4 lg:col-span-4">
        {/* Employee list */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <EmployeeList />
        </div>

        {/* Company + Employee form */}
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

      {/* ─── Right panel ─── */}
      <section className="space-y-4 lg:col-span-8">
        <PayslipPreview />
        <AnnualSummary />
      </section>
    </div>
  );
}
