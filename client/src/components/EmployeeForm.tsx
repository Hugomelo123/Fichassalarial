import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronDown, HeartPulse, Clock, CreditCard, Briefcase, Palmtree, TrendingUp } from "lucide-react";
import { usePayrollStore } from "@/store/usePayrollStore";
import { autoCISSM, computeCISFromAnnual, computeCICO2FromAnnual, getYearParams, RATES } from "@/utils/calculations";
import { useState } from "react";

/* ── Collapsible Section ── */
function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: typeof Clock; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl bg-slate-50/50 ring-1 ring-slate-100">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
      >
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

export default function EmployeeForm() {
  const {
    employees, selectedEmployeeId, updateEmployee,
    maladieHours, setMaladieHours,
    period, setPeriod,
  } = usePayrollStore();

  const emp = employees.find((e) => e.id === selectedEmployeeId);
  if (!emp) return null;

  const currentYear = parseInt(period.split("-")[0], 10) || 2025;
  const yp = getYearParams(currentYear);

  const update = (data: Record<string, unknown>) => {
    updateEmployee(emp.id, data);
  };

  const grossMensuel = emp.salaryMode === "hourly"
    ? emp.hourlyRate * emp.hoursWorked
    : emp.monthlyGross;
  const annualBrut = grossMensuel * 12;
  const autoCIS = grossMensuel > 0 ? computeCISFromAnnual(annualBrut, currentYear) : 0;
  const autoCICO2 = grossMensuel > 0 ? computeCICO2FromAnnual(annualBrut, currentYear) : 0;
  const autoCISSMVal = grossMensuel > 0 ? autoCISSM(grossMensuel, currentYear) : 0;

  return (
    <div className="space-y-4">
      {/* ── Period + Tax class ── */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label className="text-[11px] text-slate-500">Periode</Label>
          <Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 h-9 text-sm" />
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
        <div className="w-24">
          <Label className="text-[11px] text-slate-500">Indice</Label>
          <Input type="number" step="0.01" value={emp.index || ""} onChange={(e) => update({ index: parseFloat(e.target.value) || yp.index })} className="mt-1 h-9 font-mono text-sm" />
        </div>
      </div>

      {/* ── Identity ── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-slate-500">Nom complet</Label>
          <Input value={emp.name} onChange={(e) => update({ name: e.target.value })} placeholder="Jean Dupont" className="mt-1 h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Fonction</Label>
          <Input value={emp.role} onChange={(e) => update({ role: e.target.value })} placeholder="Comptable" className="mt-1 h-9 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label className="text-[11px] text-slate-500">Matricule</Label>
          <Input value={emp.ssn} onChange={(e) => update({ ssn: e.target.value })} placeholder="DEMO-500700" className="mt-1 h-9 font-mono text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">N° Sec. Sociale</Label>
          <Input value={emp.numSecSociale} onChange={(e) => update({ numSecSociale: e.target.value })} placeholder="20000101" className="mt-1 h-9 font-mono text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Degre (h/sem)</Label>
          <Input type="number" value={emp.degreeOccupation || ""} onChange={(e) => update({ degreeOccupation: parseFloat(e.target.value) || 40 })} className="mt-1 h-9 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-slate-500">Date d'entree</Label>
          <Input type="date" value={emp.entryDate} onChange={(e) => update({ entryDate: e.target.value })} className="mt-1 h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Date d'anciennete</Label>
          <Input type="date" value={emp.dateAnciennete} onChange={(e) => update({ dateAnciennete: e.target.value })} className="mt-1 h-9 text-sm" />
        </div>
      </div>

      {/* ── Salary mode ── */}
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

      {/* ── Salary inputs ── */}
      {emp.salaryMode === "monthly" ? (
        <div>
          <Label className="text-[11px] text-slate-500">Salaire brut mensuel</Label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">EUR</span>
            <Input type="number" step="0.01" value={emp.monthlyGross || ""} onChange={(e) => update({ monthlyGross: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="h-12 pl-12 font-mono text-lg font-bold text-slate-800" />
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
            <Input type="number" value={emp.hoursWorked || ""} onChange={(e) => update({ hoursWorked: parseFloat(e.target.value) || 0 })} placeholder="176" className="mt-1 h-12 pr-8 font-mono text-lg font-bold text-slate-800" />
          </div>
        </div>
      )}

      {/* ── OVERTIME ── */}
      <Section title="Heures supplementaires" icon={TrendingUp}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-slate-500">Nb heures supp.</Label>
            <Input type="number" min={0} value={emp.overtimeHours || ""} onChange={(e) => update({ overtimeHours: parseFloat(e.target.value) || 0 })} placeholder="0" className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Majoration (x)</Label>
            <Select value={String(emp.overtimeRate)} onValueChange={(v) => update({ overtimeRate: parseFloat(v) })}>
              <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1.25">+25% (x1.25)</SelectItem>
                <SelectItem value="1.4">+40% (x1.40)</SelectItem>
                <SelectItem value="1.5">+50% (x1.50)</SelectItem>
                <SelectItem value="1.7">+70% (x1.70)</SelectItem>
                <SelectItem value="2">+100% (x2.00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {emp.overtimeHours > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs">
            <span className="text-indigo-600">Montant H.S.</span>
            <span className="font-mono font-bold text-indigo-700">
              {(emp.overtimeHours * (emp.salaryMode === "hourly" ? emp.hourlyRate : emp.monthlyGross / RATES.standardMonthlyHours) * emp.overtimeRate).toFixed(2)} EUR
            </span>
          </div>
        )}
      </Section>

      {/* ── MALADIE ── */}
      <div className="rounded-xl bg-amber-50/50 p-4 ring-1 ring-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <HeartPulse className="h-4 w-4 text-amber-500" />
          <Label className="text-[11px] font-semibold text-amber-700">Absences maladie (heures ce mois)</Label>
        </div>
        <Input type="number" min={0} value={maladieHours || ""} onChange={(e) => setMaladieHours(parseFloat(e.target.value) || 0)} placeholder="0" className="h-9 pr-8 font-mono text-sm border-amber-200 bg-white" />
        {maladieHours > 0 && (
          <p className="mt-1.5 text-[11px] text-amber-600">
            {maladieHours}h = {(maladieHours / 8).toFixed(1)} jour(s) — maintien 100% employeur (77j max)
          </p>
        )}
      </div>

      {/* ── AVANTAGES & DEDUCTIONS ── */}
      <Section title="Avantages & Deductions" icon={Briefcase}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-slate-500">Frais de deplacement</Label>
            <Input type="number" step="0.01" min={0} value={emp.fraisDeplacement || ""} onChange={(e) => update({ fraisDeplacement: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Cheques repas</Label>
            <Input type="number" step="0.01" min={0} value={emp.chequesRepas || ""} onChange={(e) => update({ chequesRepas: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="mt-1 h-9 font-mono text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-slate-500">Autres avantages (+)</Label>
            <Input type="number" step="0.01" min={0} value={emp.autresAvantages || ""} onChange={(e) => update({ autresAvantages: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Autres deductions (-)</Label>
            <Input type="number" step="0.01" min={0} value={emp.autresDeductions || ""} onChange={(e) => update({ autresDeductions: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="mt-1 h-9 font-mono text-sm" />
          </div>
        </div>
      </Section>

      {/* ── CREDITS FISCAUX ── */}
      <Section title="Instructions fiscales" icon={CreditCard}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-slate-500">CIS (Salarie)</Label>
            <Input type="number" step="0.01" min={0} value={emp.CIS || ""} onChange={(e) => update({ CIS: parseFloat(e.target.value) || 0 })} placeholder={emp.CIS === 0 && autoCIS > 0 ? `${autoCIS.toFixed(2)} (auto)` : undefined} className="mt-1 h-9 font-mono text-sm" />
            <p className="mt-0.5 text-[9px] text-slate-400">{emp.CIS === 0 && grossMensuel > 0 ? `Auto: ${autoCIS.toFixed(2)} EUR/mois (selon brut)` : "0 = calcul auto selon salaire"}</p>
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">CIP (Pensionnes)</Label>
            <Input type="number" step="0.01" value={emp.CIP || ""} onChange={(e) => update({ CIP: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-slate-500">CIM (Monoparental)</Label>
            <Input type="number" step="0.01" value={emp.CIM || ""} onChange={(e) => update({ CIM: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">CISSM (Sal. minimum)</Label>
            <Input type="number" step="0.01" min={0} value={emp.CISSM || ""} onChange={(e) => update({ CISSM: parseFloat(e.target.value) || 0 })} placeholder={emp.CISSM === 0 && autoCISSMVal > 0 ? `${autoCISSMVal.toFixed(2)} (auto)` : undefined} className="mt-1 h-9 font-mono text-sm" />
            <p className="mt-0.5 text-[9px] text-slate-400">{emp.CISSM === 0 && grossMensuel > 0 ? (autoCISSMVal > 0 ? `Auto: ${autoCISSMVal.toFixed(2)} EUR (brut 1800–3600)` : "0 = auto (hors bande SSM)") : "0 = calcul auto"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-slate-500">CI-CO2 (Climat/energie)</Label>
            <Input type="number" step="0.01" min={0} value={emp.CICO2 || ""} onChange={(e) => update({ CICO2: parseFloat(e.target.value) || 0 })} placeholder={emp.CICO2 === 0 && autoCICO2 > 0 ? `${autoCICO2.toFixed(2)} (auto)` : undefined} className="mt-1 h-9 font-mono text-sm" />
            <p className="mt-0.5 text-[9px] text-slate-400">{emp.CICO2 === 0 && grossMensuel > 0 ? `Auto: ${autoCICO2.toFixed(2)} EUR/mois (selon brut)` : "0 = calcul auto selon salaire"}</p>
          </div>
        </div>
        <p className="text-[9px] text-slate-400">
          Credits mensuels appliques a la retenue d'impot sur le salaire.
        </p>
      </Section>

      {/* ── CONGES & ABSENCES ── */}
      <Section title="Conges & Absences (heures annuelles)" icon={Palmtree}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <Label className="text-[11px] text-slate-500">Report N-1 (h)</Label>
            <Input type="number" min={0} value={(emp.congesReport ?? 0) || ""} onChange={(e) => update({ congesReport: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
            <p className="mt-0.5 text-[9px] text-slate-400">Heures reportees</p>
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Droit annuel (h)</Label>
            <Input type="number" min={0} value={emp.congesAnnuels || ""} onChange={(e) => update({ congesAnnuels: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
            <p className="mt-0.5 text-[9px] text-slate-400">26j x 8h = 208h</p>
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Conges pris (h)</Label>
            <Input type="number" min={0} value={emp.congesPris || ""} onChange={(e) => update({ congesPris: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-emerald-600 font-semibold">Solde (h)</Label>
            <div className="mt-1 flex h-9 items-center rounded-md bg-emerald-50 px-3 font-mono text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
              {((emp.congesReport ?? 0) + (emp.congesAnnuels ?? 0) - (emp.congesPris ?? 0))} h
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <Label className="text-[11px] text-slate-500">Feries (h)</Label>
            <Input type="number" min={0} value={emp.feriados || ""} onChange={(e) => update({ feriados: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Recuperation (h)</Label>
            <Input type="number" min={0} value={emp.recuperation || ""} onChange={(e) => update({ recuperation: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Repos (h)</Label>
            <Input type="number" min={0} value={emp.repos || ""} onChange={(e) => update({ repos: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
          </div>
          <div>
            <Label className="text-[11px] text-slate-500">Maladie (h)</Label>
            <Input type="number" min={0} value={emp.maladieHeures || ""} onChange={(e) => update({ maladieHeures: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 font-mono text-sm" />
          </div>
        </div>
      </Section>
    </div>
  );
}
