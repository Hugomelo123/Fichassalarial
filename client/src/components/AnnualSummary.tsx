import { usePayrollStore } from "@/store/usePayrollStore";
import { CalendarDays } from "lucide-react";

export default function AnnualSummary() {
  const { results } = usePayrollStore();

  if (!results || results.salaryBrut === 0) return null;

  const annual = {
    brut: results.salaryBrut * 12,
    social: results.totalSocial * 12,
    tax: results.impots * 12,
    net: results.net * 12,
  };

  const items = [
    { label: "Brut annuel", value: annual.brut, cls: "text-slate-800" },
    { label: "Cotisations", value: -annual.social, cls: "text-red-500" },
    { label: "Impots", value: -annual.tax, cls: "text-red-500" },
    { label: "Net annuel", value: annual.net, cls: "text-emerald-700 font-bold" },
  ];

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Projection annuelle (x12)
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-[10px] text-slate-400">{item.label}</p>
            <p className={`mt-1 font-mono text-sm ${item.cls}`}>
              {item.value < 0 && "- "}
              {Math.abs(item.value).toLocaleString("fr-LU", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              <span className="ml-0.5 text-[10px] font-normal text-slate-400">EUR</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
