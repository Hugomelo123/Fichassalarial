import { usePayrollStore } from "@/store/usePayrollStore";
import {
  Calculator,
  FileText,
  LayoutDashboard,
  UserPlus,
  Trash2,
  Check,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { AppView } from "@/store/usePayrollStore";
import { useState } from "react";

import CompanyForm from "@/components/CompanyForm";
import EmployeeForm from "@/components/EmployeeForm";
import SalaryBreakdown from "@/components/SalaryBreakdown";
import PayslipPreview from "@/components/PayslipPreview";
import AnnualSummary from "@/components/AnnualSummary";
import PayslipHistory from "@/components/PayslipHistory";
import Dashboard from "@/components/Dashboard";

/* ── Navigation config ── */
const navItems: { id: AppView; label: string; icon: typeof Calculator }[] = [
  { id: "simulator", label: "Simulateur", icon: Calculator },
  { id: "history", label: "Fiches de paie", icon: FileText },
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
];

export default function Home() {
  const store = usePayrollStore();
  const {
    view, setView,
    employees, selectedEmployeeId, addEmployee, selectEmployee, removeEmployee,
    payslips,
    company,
  } = store;

  const [companyOpen, setCompanyOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="flex w-[260px] flex-shrink-0 flex-col bg-[#0c0f1a] text-slate-300">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 px-5 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Calculator className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">LuxPayroll</span>
            <span className="ml-1.5 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400">
              2026
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 pt-4 pb-2">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Menu
          </p>
          {navItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-indigo-600/15 text-indigo-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.id === "history" && payslips.length > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {payslips.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Company toggle */}
        <div className="px-3 pt-2">
          <button
            onClick={() => setCompanyOpen(!companyOpen)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
          >
            <Building2 className="h-4 w-4" />
            <span className="flex-1 text-left">Entreprise</span>
            {company.name && <span className="mr-1 max-w-[80px] truncate text-[10px] text-slate-500">{company.name}</span>}
            {companyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {companyOpen && (
            <div className="mt-1 rounded-lg bg-white/5 p-3">
              <CompanyForm />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-5 my-3 h-px bg-white/5" />

        {/* Employee list */}
        <div className="flex-1 overflow-hidden px-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Salaries
            </p>
            <button
              onClick={() => addEmployee()}
              className="flex items-center gap-1 rounded-md bg-indigo-600/20 px-2 py-1 text-[10px] font-semibold text-indigo-400 transition-colors hover:bg-indigo-600/30"
            >
              <UserPlus className="h-3 w-3" />
              Ajouter
            </button>
          </div>

          <div className="sidebar-scroll overflow-y-auto max-h-[calc(100vh-420px)] space-y-0.5">
            {employees.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[11px] text-slate-600">Aucun salarie</p>
                <button
                  onClick={() => addEmployee()}
                  className="mt-2 text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                >
                  + Ajouter le premier
                </button>
              </div>
            ) : (
              employees.map((emp) => {
                const active = emp.id === selectedEmployeeId;
                return (
                  <div
                    key={emp.id}
                    onClick={() => { selectEmployee(emp.id); setView("simulator"); }}
                    className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all ${
                      active
                        ? "bg-indigo-600/15"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        active ? "bg-indigo-600 text-white" : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {emp.name ? emp.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[12px] font-medium ${active ? "text-white" : "text-slate-300"}`}>
                        {emp.name || "Sans nom"}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {emp.role || "—"}
                        {emp.salaryMode === "hourly" ? " · Horaire" : ""}
                      </p>
                    </div>
                    {active && <Check className="h-3 w-3 flex-shrink-0 text-indigo-400" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeEmployee(emp.id); }}
                      className="flex-shrink-0 rounded p-1 text-transparent transition-colors group-hover:text-slate-600 hover:!text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-5 py-3 text-center text-[9px] text-slate-600">
          Grand-Duche de Luxembourg
        </div>
      </aside>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="flex-1 overflow-y-auto bg-[#f1f4f9]">
        <div className="mx-auto max-w-6xl px-6 py-6">
          {view === "simulator" && <SimulatorView />}
          {view === "history" && <PayslipHistory />}
          {view === "dashboard" && <Dashboard />}
        </div>
      </main>
    </div>
  );
}

/* ── Simulator View ── */
function SimulatorView() {
  const { selectedEmployeeId, employees } = usePayrollStore();
  const emp = employees.find((e) => e.id === selectedEmployeeId);

  if (!emp) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <Calculator className="mb-4 h-12 w-12 text-slate-300" />
        <h2 className="text-lg font-semibold text-slate-700">Bienvenue sur LuxPayroll</h2>
        <p className="mt-1 text-sm text-slate-400">
          Ajoutez un salarie dans le panneau de gauche pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {emp.name || "Nouveau salarie"}
        </h1>
        <p className="text-sm text-slate-400">
          {emp.role || "Fonction non definie"}
          {emp.ssn && <span className="ml-2 font-mono text-xs text-slate-300">· {emp.ssn}</span>}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        {/* Left: Form + Breakdown */}
        <div className="space-y-4 xl:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <EmployeeForm />
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Decomposition du salaire
            </h3>
            <SalaryBreakdown />
          </div>
        </div>

        {/* Right: Preview + Annual */}
        <div className="space-y-4 xl:col-span-7">
          <PayslipPreview />
          <AnnualSummary />
        </div>
      </div>
    </div>
  );
}
