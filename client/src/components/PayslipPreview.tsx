import { usePayrollStore } from "@/store/usePayrollStore";
import { Button } from "@/components/ui/button";
import { Download, FileCode, Save, Check } from "lucide-react";
import { generatePayslipPDF } from "@/utils/generatePDF";
import { generateCCSSXML } from "@/utils/generateXML";
import { useState } from "react";

const MONTHS: Record<string, string> = {
  "01": "Janvier", "02": "Fevrier", "03": "Mars", "04": "Avril",
  "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Aout",
  "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Decembre",
};

function fmtPeriod(p: string) { const [y, m] = p.split("-"); return `${MONTHS[m] || m} ${y}`; }

export default function PayslipPreview() {
  const { employees, selectedEmployeeId, company, results, period, savePayslip } = usePayrollStore();
  const emp = employees.find((e) => e.id === selectedEmployeeId);
  const [saved, setSaved] = useState(false);

  if (!results || !emp || results.salaryBrut === 0) return null;

  const onPDF = () => generatePayslipPDF(emp, company, results, emp.salaryMode, emp.hourlyRate, emp.hoursWorked, period);
  const onXML = () => generateCCSSXML(emp, company, results, period);
  const onSave = () => { savePayslip(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Apercu fiche de paie
        </h3>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={onSave} className={`h-7 gap-1 text-[11px] ${saved ? "border-emerald-300 bg-emerald-50 text-emerald-700" : ""}`}>
            {saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
            {saved ? "OK" : "Sauvegarder"}
          </Button>
          <Button variant="outline" size="sm" onClick={onXML} className="h-7 gap-1 text-[11px]">
            <FileCode className="h-3 w-3" /> XML
          </Button>
          <Button size="sm" onClick={onPDF} className="h-7 gap-1 bg-indigo-600 text-[11px] hover:bg-indigo-700">
            <Download className="h-3 w-3" /> PDF
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-teal-400" />

        <div className="p-6 sm:p-8 text-slate-800">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-[17px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Fiche de Remuneration
            </h1>
            <div className="mx-auto mt-2 h-0.5 w-16 rounded bg-indigo-500" />
            <p className="mt-2 text-xs text-slate-400">{fmtPeriod(period)}</p>
          </div>

          {/* Employer / Employee cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Employeur</p>
              <p className="text-sm font-semibold text-slate-900">{company.name || "—"}</p>
              <p className="mt-0.5 text-slate-500">{company.address || "—"}</p>
              {company.tva && <p className="mt-2 inline-block rounded bg-white px-2 py-0.5 font-mono text-[10px] text-slate-400 ring-1 ring-slate-100">TVA {company.tva}</p>}
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-right ring-1 ring-slate-100">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Salarie</p>
              <p className="text-sm font-semibold text-slate-900">{emp.name || "—"}</p>
              <p className="mt-0.5 text-slate-500">{emp.role || "—"}</p>
              <div className="mt-2 flex justify-end gap-1.5">
                <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-slate-400 ring-1 ring-slate-100">Mat. {emp.ssn || "—"}</span>
                <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-slate-400 ring-1 ring-slate-100">Cl. {emp.taxClass}</span>
              </div>
            </div>
          </div>

          {/* Hours badges */}
          {(results.heuresMaladie > 0 || emp.salaryMode === "hourly") && (
            <div className="mb-5 flex flex-wrap gap-2">
              {emp.salaryMode === "hourly" && <Badge color="indigo" label="Taux" value={`${emp.hourlyRate.toFixed(2)} EUR/h`} />}
              <Badge color="blue" label="H. normales" value={`${results.heuresNormales} h`} />
              {results.heuresMaladie > 0 && <Badge color="amber" label="H. maladie" value={`${results.heuresMaladie} h`} />}
              <Badge color="slate" label="Total" value={`${results.heuresTotales} h`} />
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-4 py-2.5 text-left">Description</th>
                  <th className="px-4 py-2.5 text-right">Base</th>
                  <th className="px-4 py-2.5 text-right">Taux</th>
                  <th className="px-4 py-2.5 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="font-semibold text-slate-900 bg-indigo-50/30">
                  <td className="px-4 py-2.5">Salaire brut mensuel</td>
                  <td className="px-4 py-2.5 text-right" colSpan={2} />
                  <td className="px-4 py-2.5 text-right font-mono">{results.salaryBrut.toFixed(2)}</td>
                </tr>
                <TRow label="Assurance Maladie / Soins" base={results.salaryBrut} rate="2.80%" amt={results.maladieSoins} />
                <TRow label="Assurance Maladie (Especes)" base={results.salaryBrut} rate="0.25%" amt={results.maladieEspeces} />
                <TRow label="Assurance Pension" base={results.salaryBrut} rate="8.00%" amt={results.pension} />
                <TRow label="Assurance Dependance" base={results.salaryBrut} rate="1.40%" amt={results.dependance} />
                <tr className="bg-slate-50 font-semibold text-slate-700">
                  <td className="px-4 py-2" colSpan={3}>Total cotisations</td>
                  <td className="px-4 py-2 text-right font-mono text-red-500">- {results.totalSocial.toFixed(2)}</td>
                </tr>
                <TRow label="Impot sur salaire (RTS)" base={results.totalImposable} rate="—" amt={results.impots} />
                <tr className="text-emerald-700">
                  <td className="px-4 py-2">Credit d'impot (CIS / CISSM)</td>
                  <td className="px-4 py-2 text-right" colSpan={2} />
                  <td className="px-4 py-2 text-right font-mono font-semibold">+ {results.credit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* NET */}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Net a payer</p>
              <p className="text-[10px] text-slate-500">Virement SEPA sur compte IBAN</p>
            </div>
            <p className="font-mono text-2xl font-bold">{results.net.toFixed(2)} <span className="text-sm font-normal text-slate-400">EUR</span></p>
          </div>

          <p className="mt-8 text-center text-[8px] uppercase tracking-widest text-slate-300">
            LuxPayroll 2026 &middot; Simulation indicative &middot; Grand-Duche de Luxembourg
          </p>
        </div>
      </div>
    </div>
  );
}

function TRow({ label, base, rate, amt }: { label: string; base: number; rate: string; amt: number }) {
  return (
    <tr className="text-slate-600 hover:bg-slate-50/50">
      <td className="px-4 py-2">{label}</td>
      <td className="px-4 py-2 text-right font-mono text-slate-400">{base.toFixed(2)}</td>
      <td className="px-4 py-2 text-right text-slate-400">{rate}</td>
      <td className="px-4 py-2 text-right font-mono text-red-500">- {amt.toFixed(2)}</td>
    </tr>
  );
}

function Badge({ color, label, value }: { color: string; label: string; value: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium ring-1 ${colors[color]}`}>
      <span className="text-[9px] opacity-60">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </span>
  );
}
