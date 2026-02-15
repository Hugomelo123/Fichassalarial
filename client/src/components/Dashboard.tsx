import { usePayrollStore } from "@/store/usePayrollStore";
import { Users, Banknote, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { employees, payslips, results, selectedEmployeeId } = usePayrollStore();

  const totBrut = payslips.reduce((s, p) => s + p.salaryBrut, 0);
  const totNet = payslips.reduce((s, p) => s + (p.netAPayer || p.net), 0);
  const totCot = payslips.reduce((s, p) => s + p.results.totalSocial, 0);
  const totImpots = payslips.reduce((s, p) => s + p.results.impots, 0);
  const uniqueEmps = new Set(payslips.map((p) => p.employeeId)).size;

  const kpis = [
    { label: "Salaries actifs", value: String(employees.length), sub: `${uniqueEmps} avec fiches`, icon: Users, bg: "bg-indigo-50", fg: "text-indigo-600", ring: "ring-indigo-100" },
    { label: "Brut total verse", value: fmt(totBrut), sub: `${payslips.length} fiches`, icon: Banknote, bg: "bg-blue-50", fg: "text-blue-600", ring: "ring-blue-100" },
    { label: "Cotisations totales", value: fmt(totCot), sub: fmt(totImpots) + " impots", icon: TrendingDown, bg: "bg-red-50", fg: "text-red-500", ring: "ring-red-100" },
    { label: "Net total paye", value: fmt(totNet), sub: "montant final", icon: TrendingUp, bg: "bg-emerald-50", fg: "text-emerald-600", ring: "ring-emerald-100" },
  ];

  const empSummary = employees.map((emp) => {
    const slips = payslips.filter((p) => p.employeeId === emp.id);
    const last = slips[0];
    const isCurrent = emp.id === selectedEmployeeId;
    return { emp, slips: slips.length, last, isCurrent };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-sm text-slate-400">Vue d'ensemble de la masse salariale</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${k.bg} ring-1 ${k.ring}`}>
              <k.icon className={`h-5 w-5 ${k.fg}`} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{k.label}</p>
              <p className={`mt-0.5 font-mono text-lg font-bold ${k.fg}`}>{k.value}</p>
              <p className="text-[10px] text-slate-400">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current simulation */}
      {results && results.salaryBrut > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            <BarChart3 className="h-3.5 w-3.5" />
            Simulation active
            <span className="ml-auto rounded bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
              {employees.find(e => e.id === selectedEmployeeId)?.name || "—"}
            </span>
          </h3>
          <div className="grid grid-cols-6 gap-3">
            <MiniCard label="Brut" value={results.salaryBrut} />
            <MiniCard label="Social" value={results.totalSocial} negative />
            <MiniCard label="Impots" value={results.impots} negative />
            <MiniCard label="Credits" value={results.totalCredits} positive />
            <MiniCard label="Net" value={results.net} />
            <MiniCard label="A Payer" value={results.netAPayer} highlight />
          </div>
        </div>
      )}

      {/* Employee table */}
      {empSummary.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3 bg-slate-50">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recapitulatif par salarie</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-2.5 text-left">Salarie</th>
                  <th className="px-5 py-2.5 text-left">Mode</th>
                  <th className="px-5 py-2.5 text-right">Brut</th>
                  <th className="px-5 py-2.5 text-right">Net</th>
                  <th className="px-5 py-2.5 text-right">Fiches</th>
                  <th className="px-5 py-2.5 text-right">Conges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {empSummary.map(({ emp, slips, last, isCurrent }) => (
                  <tr key={emp.id} className={isCurrent ? "bg-indigo-50/30" : "hover:bg-slate-50"}>
                    <td className="px-5 py-3 flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${isCurrent ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {(emp.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{emp.name || "Sans nom"}</p>
                        <p className="text-[10px] text-slate-400">{emp.role || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${emp.salaryMode === "hourly" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                        {emp.salaryMode === "hourly" ? "Horaire" : "Mensuel"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-600">
                      {last ? last.salaryBrut.toFixed(2) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-emerald-700">
                      {last ? (last.netAPayer || last.net).toFixed(2) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {slips > 0 ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">{slips}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">
                      {emp.congesPris}/{emp.congesAnnuels} h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCard({ label, value, negative, positive, highlight }: { label: string; value: number; negative?: boolean; positive?: boolean; highlight?: boolean }) {
  let color = "text-slate-800";
  if (negative) color = "text-red-500";
  if (positive) color = "text-emerald-600";
  if (highlight) color = "text-indigo-700";
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? "bg-indigo-100/50 ring-1 ring-indigo-200" : "bg-white ring-1 ring-slate-100"}`}>
      <p className="text-[9px] font-medium uppercase text-slate-400">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-bold ${color}`}>{value.toFixed(2)}</p>
    </div>
  );
}

function fmt(n: number) { return n.toLocaleString("fr-LU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
