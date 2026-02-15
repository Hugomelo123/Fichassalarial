import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, HeartPulse } from "lucide-react";
import { usePayrollStore } from "@/store/usePayrollStore";
import { STANDARD_MONTHLY_HOURS } from "@/utils/calculations";

export default function EmployeeForm() {
  const {
    employees,
    selectedEmployeeId,
    updateEmployee,
    maladieHours,
    setMaladieHours,
  } = usePayrollStore();

  const emp = employees.find((e) => e.id === selectedEmployeeId);
  if (!emp) {
    return (
      <p className="py-6 text-center text-xs text-slate-400">
        Selectionnez ou ajoutez un salarie.
      </p>
    );
  }

  const update = (data: Record<string, unknown>) => updateEmployee(emp.id, data);

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] font-medium text-slate-500">Nom complet</Label>
          <Input
            value={emp.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Jean Dupont"
            className="mt-1 h-9 bg-slate-50/50 text-sm placeholder:text-slate-300"
          />
        </div>
        <div>
          <Label className="text-[11px] font-medium text-slate-500">Matricule CCSS</Label>
          <Input
            value={emp.ssn}
            onChange={(e) => update({ ssn: e.target.value })}
            placeholder="YYYYMMDD-XXXXX"
            className="mt-1 h-9 bg-slate-50/50 font-mono text-sm placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] font-medium text-slate-500">Fonction</Label>
          <Input
            value={emp.role}
            onChange={(e) => update({ role: e.target.value })}
            placeholder="Comptable Senior"
            className="mt-1 h-9 bg-slate-50/50 text-sm placeholder:text-slate-300"
          />
        </div>
        <div>
          <Label className="text-[11px] font-medium text-slate-500">Classe d'impot</Label>
          <Select
            value={emp.taxClass}
            onValueChange={(val) => update({ taxClass: val })}
          >
            <SelectTrigger className="mt-1 h-9 bg-slate-50/50 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Classe 1 — Celibataire</SelectItem>
              <SelectItem value="1a">Classe 1a — Veuf / Separe</SelectItem>
              <SelectItem value="2">Classe 2 — Marie / Pacse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock className="h-4 w-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">Remuneration</h3>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border bg-slate-50/80 p-0.5">
          <button
            type="button"
            onClick={() => update({ salaryMode: "monthly" })}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
              emp.salaryMode === "monthly"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Salaire mensuel
          </button>
          <button
            type="button"
            onClick={() => update({ salaryMode: "hourly" })}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all ${
              emp.salaryMode === "hourly"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Taux horaire
          </button>
        </div>

        {emp.salaryMode === "monthly" ? (
          <div>
            <Label className="text-[11px] font-medium text-slate-500">Salaire brut mensuel</Label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                EUR
              </span>
              <Input
                type="number"
                value={emp.monthlyGross || ""}
                onChange={(e) => update({ monthlyGross: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-11 bg-slate-50/50 pl-12 font-mono text-base font-bold text-slate-800 placeholder:text-slate-300"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] font-medium text-slate-500">Taux horaire brut</Label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
                  EUR/h
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={emp.hourlyRate || ""}
                  onChange={(e) => update({ hourlyRate: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="h-11 bg-slate-50/50 pl-14 font-mono text-base font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>
            <div>
              <Label className="text-[11px] font-medium text-slate-500">Heures travaillees</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={emp.hoursWorked || ""}
                  onChange={(e) => update({ hoursWorked: parseFloat(e.target.value) || 0 })}
                  placeholder={String(STANDARD_MONTHLY_HOURS)}
                  className="h-11 bg-slate-50/50 pr-8 font-mono text-base font-bold text-slate-800 placeholder:text-slate-300"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">h</span>
              </div>
            </div>
          </div>
        )}

        {emp.salaryMode === "hourly" && emp.hourlyRate > 0 && emp.hoursWorked > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-indigo-50/60 px-3 py-2 text-xs">
            <span className="text-indigo-600">Brut mensuel calcule</span>
            <span className="font-mono font-bold text-indigo-700">
              {(emp.hourlyRate * emp.hoursWorked).toFixed(2)} EUR
            </span>
          </div>
        )}
      </section>

      {/* Maladie */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-slate-500">
          <HeartPulse className="h-4 w-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">Absences maladie</h3>
        </div>
        <div>
          <Label className="text-[11px] font-medium text-slate-500">Heures maladie</Label>
          <div className="relative mt-1">
            <Input
              type="number"
              min={0}
              value={maladieHours || ""}
              onChange={(e) => setMaladieHours(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="h-9 bg-slate-50/50 pr-8 font-mono text-sm placeholder:text-slate-300"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">h</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Maintien a 100 % les 77 premiers jours.
          </p>
          {maladieHours > 0 && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700">
              <HeartPulse className="h-3 w-3" />
              {maladieHours}h &mdash; {(maladieHours / 8).toFixed(1)} jour(s)
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
