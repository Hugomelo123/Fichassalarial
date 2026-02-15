import { usePayrollStore } from "@/store/usePayrollStore";

export default function CompanyForm() {
  const { company, setCompany } = usePayrollStore();

  const fields = [
    { key: "name" as const, label: "Raison sociale", placeholder: "LuxCorp S.A." },
    { key: "address" as const, label: "Adresse", placeholder: "2, Rue du Fort Thungen, L-1499" },
    { key: "tva" as const, label: "N° TVA", placeholder: "LU12345678", mono: true },
  ];

  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-[10px] font-medium text-slate-500">{f.label}</label>
          <input
            value={company[f.key]}
            onChange={(e) => setCompany({ [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className={`mt-0.5 block w-full rounded-md border-0 bg-white/5 px-2.5 py-1.5 text-[12px] text-slate-200 ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 ${f.mono ? "font-mono" : ""}`}
          />
        </div>
      ))}
    </div>
  );
}
