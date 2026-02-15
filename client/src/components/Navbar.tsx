import { Calculator, FileText, LayoutDashboard } from "lucide-react";
import { usePayrollStore, type AppView } from "@/store/usePayrollStore";

const navItems: { id: AppView; label: string; icon: typeof Calculator }[] = [
  { id: "simulator", label: "Simulateur", icon: Calculator },
  { id: "history", label: "Fiches", icon: FileText },
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
];

export default function Navbar() {
  const { view, setView, payslips } = usePayrollStore();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-200">
              <Calculator className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                LuxPayroll
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                2026
              </span>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.id === "history" && payslips.length > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                      {payslips.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
