import { usePayrollStore } from "@/store/usePayrollStore";

export default function SalaryBreakdown() {
  const { results } = usePayrollStore();

  if (!results || results.salaryBrut === 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400">
        En attente de donnees...
      </p>
    );
  }

  const total = results.salaryBrut;
  const pct = (v: number) => ((v / total) * 100).toFixed(1);

  const sections = [
    {
      title: "Cotisations sociales",
      rows: [
        { label: "Maladie / Soins", value: results.maladieSoins, rate: "2.80%" },
        { label: "Maladie / Especes", value: results.maladieEspeces, rate: "0.25%" },
        { label: "Pension", value: results.pension, rate: "8.00%" },
        { label: "Dependance", value: results.dependance, rate: "1.40%" },
      ],
    },
    {
      title: "Fiscalite",
      rows: [
        { label: "Impot retenu (RTS)", value: results.impots },
        { label: "Credit d'impot (CIS)", value: -results.credit, credit: true },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Gross */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-800">Salaire brut</span>
        <span className="font-mono font-bold text-slate-900">{results.salaryBrut.toFixed(2)}</span>
      </div>

      {/* Visual bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-red-400" style={{ width: `${pct(results.totalSocial)}%` }} title="Cotisations" />
        <div className="bg-orange-400" style={{ width: `${pct(results.impots)}%` }} title="Impots" />
        <div className="bg-emerald-500" style={{ width: `${pct(results.net)}%` }} title="Net" />
      </div>
      <div className="flex gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Social {pct(results.totalSocial)}%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" />Impots {pct(results.impots)}%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Net {pct(results.net)}%</span>
      </div>

      {/* Detail sections */}
      {sections.map((sec) => (
        <div key={sec.title}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{sec.title}</p>
          {sec.rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1 text-xs">
              <span className="text-slate-500">
                {row.label}
                {"rate" in row && row.rate && <span className="ml-1 text-slate-300">({row.rate})</span>}
              </span>
              <span className={`font-mono font-medium ${"credit" in row && row.credit ? "text-emerald-600" : "text-red-500"}`}>
                {"credit" in row && row.credit ? `+ ${results.credit.toFixed(2)}` : `- ${row.value.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* Net */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-200">Net a payer</p>
        <p className="font-mono text-xl font-bold">{results.net.toFixed(2)} <span className="text-sm font-normal text-emerald-200">EUR</span></p>
      </div>
    </div>
  );
}
