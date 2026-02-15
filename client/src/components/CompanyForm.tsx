import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { usePayrollStore } from "@/store/usePayrollStore";

export default function CompanyForm() {
  const { company, setCompany } = usePayrollStore();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Building2 className="h-4 w-4" />
        <h3 className="text-xs font-semibold uppercase tracking-wider">Employeur</h3>
      </div>

      <div className="grid gap-3">
        <div>
          <Label htmlFor="companyName" className="text-[11px] font-medium text-slate-500">
            Raison sociale
          </Label>
          <Input
            id="companyName"
            value={company.name}
            onChange={(e) => setCompany({ name: e.target.value })}
            placeholder="Ex: LuxCorp S.A."
            className="mt-1 h-9 bg-slate-50/50 text-sm placeholder:text-slate-300"
          />
        </div>

        <div>
          <Label htmlFor="companyAddress" className="text-[11px] font-medium text-slate-500">
            Adresse
          </Label>
          <Input
            id="companyAddress"
            value={company.address}
            onChange={(e) => setCompany({ address: e.target.value })}
            placeholder="2, Rue du Fort Thüngen, L-1499 Luxembourg"
            className="mt-1 h-9 bg-slate-50/50 text-sm placeholder:text-slate-300"
          />
        </div>

        <div>
          <Label htmlFor="companyTva" className="text-[11px] font-medium text-slate-500">
            N° TVA / Matricule
          </Label>
          <Input
            id="companyTva"
            value={company.tva}
            onChange={(e) => setCompany({ tva: e.target.value })}
            placeholder="LU12345678"
            className="mt-1 h-9 bg-slate-50/50 font-mono text-sm placeholder:text-slate-300"
          />
        </div>
      </div>
    </section>
  );
}
