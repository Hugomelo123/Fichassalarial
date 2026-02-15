import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { HeartPulse } from "lucide-react";
import { usePayrollStore } from "@/store/usePayrollStore";
import { STANDARD_MONTHLY_HOURS } from "@/utils/calculations";

export default function EmployeeForm() {
  const {
    employees, selectedEmployeeId, updateEmployee,
    maladieHours, setMaladieHours,
    period, setPeriod,
  } = usePayrollStore();

  const emp = employees.find((e) => e.id === selectedEmployeeId);
  if (!emp) return null;

  const update = (data: Record<string, unknown>) => updateEmployee(emp.id, data);

  return (
    <div className="space-y-5">
      {/* Period */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label className="text-[11px] text-slate-500">Periode de reference</Label>
          <Input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 h-9 text-sm"
          />
        </div>
        <div className="flex-1">
          <Label className="text-[11px] text-slate-500">Classe d'impot</Label>
          <Select value={emp.taxClass} onValueChange={(v) => update({ taxClass: v })}>
            <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Classe 1</SelectItem>
              <SelectItem value="1a">Classe 1a</SelectItem>
              <SelectItem value="2">Classe 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Identity row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-[11px] text-slate-500">Nom complet</Label>
          <Input value={emp.name} onChange={(e) => update({ name: e.target.value })} placeholder="Jean Dupont" className="mt-1 h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Fonction</Label>
          <Input value={emp.role} onChange={(e) => update({ role: e.target.value })} placeholder="Comptable" className="mt-1 h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Matricule</Label>
          <Input value={emp.ssn} onChange={(e) => update({ ssn: e.target.value })} placeholder="19850315-XXX" className="mt-1 h-9 font-mono text-sm" />
        </div>
      </div>

      {/* Salary mode */}
      <div>
        <Label className="text-[11px] text-slate-500">Mode de remuneration</Label>
        <div className="mt-1 flex rounded-lg bg-slate-100 p-0.5">
          {(["monthly", "hourly"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => update({ salaryMode: mode })}
              className={`flex-1 rounded-md py-2 text-xs font-semibold transition-all ${
                emp.salaryMode === mode
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {mode === "monthly" ? "Mensuel" : "Horaire"}
            </button>
          ))}
        </div>
      </div>

      {/* Salary inputs */}
      {emp.salaryMode === "monthly" ? (
        <div>
          <Label className="text-[11px] text-slate-500">Salaire brut mensuel</Label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">EUR</span>
            <Input
              type="number" step="0.01"
              value={emp.monthlyGross || ""}
              onChange={(e) => update({ monthlyGross: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="h-12 pl-12 font-mono text-lg font-bold text-slate-800"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-slate-500">Taux horaire</Label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">EUR/h</span>
              <Input type="number" step="0.01" value={emp.hourlyRate || ""} onChange={(e) => update({ hourlyRate: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="h-12 pl-14 font-mono text-lg font-bold text-slate-800" />
            </div>
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Heures / mois</Label>
            <div className="relative mt-1">
              <Input type="number" value={emp.hoursWorked || ""} onChange={(e) => update({ hoursWorked: parseFloat(e.target.value) || 0 })} placeholder={String(STANDARD_MONTHLY_HOURS)} className="h-12 pr-8 font-mono text-lg font-bold text-slate-800" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">h</span>
            </div>
          </div>
        </div>
      )}

      {emp.salaryMode === "hourly" && emp.hourlyRate > 0 && emp.hoursWorked > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-2.5 text-xs">
          <span className="font-medium text-indigo-600">Brut mensuel calcule</span>
          <span className="font-mono text-sm font-bold text-indigo-700">{(emp.hourlyRate * emp.hoursWorked).toFixed(2)} EUR</span>
        </div>
      )}

      {/* Maladie */}
      <div className="rounded-xl bg-amber-50/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <HeartPulse className="h-4 w-4 text-amber-500" />
          <Label className="text-[11px] font-semibold text-amber-700">Absences maladie</Label>
        </div>
        <div className="relative">
          <Input type="number" min={0} value={maladieHours || ""} onChange={(e) => setMaladieHours(parseFloat(e.target.value) || 0)} placeholder="0" className="h-9 pr-8 font-mono text-sm border-amber-200 bg-white" />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400">h</span>
        </div>
        {maladieHours > 0 && (
          <p className="mt-1.5 text-[11px] text-amber-600">
            {maladieHours}h = {(maladieHours / 8).toFixed(1)} jour(s) — maintien 100 % employeur
          </p>
        )}
      </div>
    </div>
  );
}
