import { usePayrollStore } from "@/store/usePayrollStore";
import { Button } from "@/components/ui/button";
import { Download, FileCode, FileText, Save } from "lucide-react";
import { generatePayslipPDF } from "@/utils/generatePDF";
import { generateCCSSXML } from "@/utils/generateXML";
import { useState } from "react";

export default function PayslipPreview() {
  const {
    employees,
    selectedEmployeeId,
    company,
    results,
    period,
    maladieHours,
    savePayslip,
  } = usePayrollStore();

  const emp = employees.find((e) => e.id === selectedEmployeeId);
  const [saved, setSaved] = useState(false);

  const handleDownloadPDF = () => {
    if (results && emp)
      generatePayslipPDF(emp, company, results, emp.salaryMode, emp.hourlyRate, emp.hoursWorked, period);
  };

  const handleDownloadXML = () => {
    if (results && emp) generateCCSSXML(emp, company, results, period);
  };

  const handleSave = () => {
    savePayslip();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!results || !emp || results.salaryBrut === 0) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 text-center">
        <FileText className="mb-3 h-10 w-10 text-slate-200" />
        <p className="text-sm text-slate-400">
          Renseignez les donnees pour generer l'apercu.
        </p>
      </div>
    );
  }

  const periodLabel = formatPeriod(period);

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Apercu fiche de paie
        </h3>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className={`h-7 gap-1 text-[11px] transition-colors ${
              saved ? "border-emerald-300 bg-emerald-50 text-emerald-700" : ""
            }`}
          >
            <Save className="h-3 w-3" />
            {saved ? "Sauvegardee !" : "Sauvegarder"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadXML}
            className="h-7 gap-1 text-[11px]"
          >
            <FileCode className="h-3 w-3" />
            XML
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            className="h-7 gap-1 bg-indigo-600 text-[11px] hover:bg-indigo-700"
          >
            <Download className="h-3 w-3" />
            PDF
          </Button>
        </div>
      </div>

      {/* Payslip document */}
      <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-teal-500" />

        <div className="p-6 text-[13px] text-slate-800 sm:p-8" id="payslip-preview">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-lg font-bold uppercase tracking-[0.15em] text-slate-900">
              Fiche de Remuneration
            </h1>
            <p className="mt-1 text-xs text-slate-400">Periode : {periodLabel}</p>
          </div>

          {/* Employer / Employee */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Employeur</p>
              <p className="font-semibold text-slate-900">{company.name || "—"}</p>
              <p className="mt-0.5 text-slate-500">{company.address || "—"}</p>
              {company.tva && <p className="mt-1 font-mono text-[10px] text-slate-400">TVA : {company.tva}</p>}
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-right">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Salarie</p>
              <p className="font-semibold text-slate-900">{emp.name || "—"}</p>
              <p className="mt-0.5 text-slate-500">{emp.role || "—"}</p>
              <div className="mt-1 flex justify-end gap-2 font-mono text-[10px] text-slate-400">
                <span>Mat. {emp.ssn || "—"}</span>
                <span>Cl. {emp.taxClass || "1"}</span>
              </div>
            </div>
          </div>

          {/* Hours summary */}
          {(results.heuresMaladie > 0 || emp.salaryMode === "hourly") && (
            <div className="mb-4 flex gap-3 text-[11px]">
              <div className="flex-1 rounded-md bg-blue-50 px-3 py-2 text-center">
                <p className="text-[10px] text-blue-400">H. normales</p>
                <p className="font-mono font-bold text-blue-700">{results.heuresNormales} h</p>
              </div>
              {results.heuresMaladie > 0 && (
                <div className="flex-1 rounded-md bg-amber-50 px-3 py-2 text-center">
                  <p className="text-[10px] text-amber-500">H. maladie</p>
                  <p className="font-mono font-bold text-amber-700">{results.heuresMaladie} h</p>
                </div>
              )}
              <div className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-center">
                <p className="text-[10px] text-slate-400">Total</p>
                <p className="font-mono font-bold text-slate-800">{results.heuresTotales} h</p>
              </div>
              {emp.salaryMode === "hourly" && (
                <div className="flex-1 rounded-md bg-indigo-50 px-3 py-2 text-center">
                  <p className="text-[10px] text-indigo-400">Taux</p>
                  <p className="font-mono font-bold text-indigo-700">{emp.hourlyRate.toFixed(2)} EUR</p>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-2 text-left">Description</th>
                <th className="pb-2 text-right">Base</th>
                <th className="pb-2 text-right">Taux</th>
                <th className="pb-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="font-semibold text-slate-900">
                <td className="py-2">Salaire brut mensuel</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right font-mono">{results.salaryBrut.toFixed(2)}</td>
              </tr>
              <Row label="Assurance Maladie / Soins" base={results.salaryBrut} rate="2.80 %" amount={results.maladieSoins} />
              <Row label="Assurance Maladie (Especes)" base={results.salaryBrut} rate="0.25 %" amount={results.maladieEspeces} />
              <Row label="Assurance Pension" base={results.salaryBrut} rate="8.00 %" amount={results.pension} />
              <Row label="Assurance Dependance" base={results.salaryBrut} rate="1.40 %" amount={results.dependance} />
              <tr className="bg-slate-50/60 font-medium text-slate-700">
                <td className="py-2" colSpan={3}>Total cotisations sociales</td>
                <td className="py-2 text-right font-mono text-red-500">- {results.totalSocial.toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-2">Impot sur salaire (RTS)</td>
                <td className="py-2 text-right font-mono text-slate-400">{results.totalImposable.toFixed(2)}</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right font-mono text-red-500">- {results.impots.toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-2">Credit d'impot (CIS / CISSM)</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right font-mono text-emerald-600">+ {results.credit.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Net */}
          <div className="mt-6 flex items-center justify-between rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 text-white">
            <span className="text-xs font-semibold uppercase tracking-wider">Net a payer</span>
            <span className="font-mono text-xl font-bold">
              {results.net.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-slate-400">EUR</span>
            </span>
          </div>

          <p className="mt-6 text-center text-[9px] text-slate-300">
            Document genere par LuxPayroll 2026 &middot; Simulation indicative
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, base, rate, amount }: { label: string; base: number; rate: string; amount: number }) {
  return (
    <tr className="text-slate-600">
      <td className="py-2">{label}</td>
      <td className="py-2 text-right font-mono text-slate-400">{base.toFixed(2)}</td>
      <td className="py-2 text-right text-slate-500">{rate}</td>
      <td className="py-2 text-right font-mono text-red-500">- {amount.toFixed(2)}</td>
    </tr>
  );
}

function formatPeriod(period: string): string {
  const months: Record<string, string> = {
    "01": "Janvier", "02": "Fevrier", "03": "Mars", "04": "Avril",
    "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Aout",
    "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Decembre",
  };
  const [year, month] = period.split("-");
  return `${months[month] || month} ${year}`;
}
