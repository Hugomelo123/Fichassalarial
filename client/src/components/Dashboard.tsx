import { usePayrollStore } from "@/store/usePayrollStore";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  TrendingUp,
  Euro,
  ArrowLeft,
  HeartPulse,
} from "lucide-react";

export default function Dashboard() {
  const { employees, payslips, setView } = usePayrollStore();

  // Stats
  const totalPayslips = payslips.length;
  const totalBrut = payslips.reduce((s, p) => s + p.salaryBrut, 0);
  const totalNet = payslips.reduce((s, p) => s + p.net, 0);
  const totalMaladieH = payslips.reduce((s, p) => s + p.maladieHours, 0);
  const avgNet = totalPayslips > 0 ? totalNet / totalPayslips : 0;

  // Per-employee summary
  const empSummary = employees.map((emp) => {
    const slips = payslips.filter((p) => p.employeeId === emp.id);
    const brut = slips.reduce((s, p) => s + p.salaryBrut, 0);
    const net = slips.reduce((s, p) => s + p.net, 0);
    const mal = slips.reduce((s, p) => s + p.maladieHours, 0);
    return { emp, count: slips.length, brut, net, maladieH: mal };
  });

  const cards = [
    {
      label: "Salaries",
      value: String(employees.length),
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Fiches generees",
      value: String(totalPayslips),
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Masse salariale brute",
      value: `${totalBrut.toLocaleString("fr-LU", { maximumFractionDigits: 0 })} EUR`,
      icon: Euro,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Net moyen / fiche",
      value: `${avgNet.toLocaleString("fr-LU", { maximumFractionDigits: 0 })} EUR`,
      icon: TrendingUp,
      color: "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Tableau de bord
          </h2>
          <p className="text-xs text-slate-400">
            Vue d'ensemble de la masse salariale
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView("simulator")}
          className="h-8 gap-1.5 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          Simulateur
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color}`}
              >
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-mono text-lg font-bold text-slate-800">
              {card.value}
            </p>
            <p className="text-[11px] text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Employee table */}
      {empSummary.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b bg-slate-50/60 px-5 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Resume par salarie
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 text-left">Salarie</th>
                  <th className="px-5 py-3 text-right">Fiches</th>
                  <th className="px-5 py-3 text-right">Total brut</th>
                  <th className="px-5 py-3 text-right">Total net</th>
                  <th className="px-5 py-3 text-right">Maladie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empSummary.map(({ emp, count, brut, net, maladieH }) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                          {emp.name ? emp.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {emp.name || "Sans nom"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {emp.role || "—"} · Cl. {emp.taxClass}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-600">
                      {count}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-600">
                      {brut.toLocaleString("fr-LU", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-emerald-700">
                      {net.toLocaleString("fr-LU", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {maladieH > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <HeartPulse className="h-3 w-3" />
                          {maladieH} h
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {employees.length === 0 && payslips.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-slate-200" />
          <p className="text-sm text-slate-400">Pas encore de donnees.</p>
          <p className="mt-1 text-xs text-slate-300">
            Ajoutez des salaries et generez des fiches pour voir le tableau de bord.
          </p>
        </div>
      )}
    </div>
  );
}
