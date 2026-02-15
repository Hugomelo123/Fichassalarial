import { usePayrollStore } from "@/store/usePayrollStore";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function SalaryBreakdown() {
  const { results } = usePayrollStore();

  if (!results || results.salaryBrut === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-slate-400">
        <Minus className="mb-2 h-6 w-6 opacity-40" />
        <p className="text-xs">Renseignez un salaire pour voir le detail.</p>
      </div>
    );
  }

  const retentionRate =
    results.salaryBrut > 0
      ? ((results.salaryBrut - results.net) / results.salaryBrut) * 100
      : 0;

  const rows = [
    { label: "Salaire brut", value: results.salaryBrut, type: "neutral" as const },
    { label: "Maladie / Soins (2.80 %)", value: -results.maladieSoins, type: "deduction" as const },
    { label: "Maladie / Especes (0.25 %)", value: -results.maladieEspeces, type: "deduction" as const },
    { label: "Pension (8.00 %)", value: -results.pension, type: "deduction" as const },
    { label: "Dependance (1.40 %)", value: -results.dependance, type: "deduction" as const },
    { label: "Impot retenu", value: -results.impots, type: "deduction" as const },
    { label: "Credit d'impot (CIS)", value: results.credit, type: "addition" as const },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-slate-50"
          >
            <span className="text-slate-600">{row.label}</span>
            <span
              className={`font-mono font-medium ${
                row.type === "deduction"
                  ? "text-red-500"
                  : row.type === "addition"
                    ? "text-emerald-600"
                    : "text-slate-800"
              }`}
            >
              {row.type === "deduction" && "- "}
              {row.type === "addition" && "+ "}
              {Math.abs(row.value).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Net result */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-lg shadow-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
              Net a payer
            </p>
            <p className="mt-0.5 font-mono text-2xl font-bold">
              {results.net.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-emerald-200">EUR</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-emerald-200">
              {retentionRate > 20 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              <span className="text-[10px] font-medium">
                {retentionRate.toFixed(1)} % retenu
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
