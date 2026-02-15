import { usePayrollStore } from "@/store/usePayrollStore";

export default function AnnualSummary() {
  const { results } = usePayrollStore();
  if (!results || results.salaryBrut === 0) return null;

  const items = [
    { label: "Brut annuel", value: results.salaryBrut * 12, color: "text-slate-900" },
    { label: "Cotisations", value: -(results.totalSocial * 12), color: "text-red-500" },
    { label: "Impots", value: -(results.impots * 12), color: "text-orange-500" },
    { label: "Net annuel", value: results.net * 12, color: "text-emerald-700 font-bold" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        Projection annuelle (x12)
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
            <p className="text-[9px] font-medium uppercase text-slate-400">{it.label}</p>
            <p className={`mt-1 font-mono text-sm ${it.color}`}>
              {it.value < 0 ? "- " : ""}{Math.abs(it.value).toLocaleString("fr-LU", { maximumFractionDigits: 0 })}
              <span className="ml-0.5 text-[9px] font-normal text-slate-300">EUR</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
