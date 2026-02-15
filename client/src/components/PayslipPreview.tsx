import { usePayrollStore } from "@/store/usePayrollStore";
import { Button } from "@/components/ui/button";
import { Download, FileCode, Save, Check } from "lucide-react";
import { generatePayslipPDF } from "@/utils/generatePDF";
import { generateCCSSXML } from "@/utils/generateXML";
import { getWorkingDays, getCalendarDays } from "@/utils/calculations";
import { useState } from "react";

const MONTHS: Record<string, string> = {
  "01": "Janvier", "02": "Fevrier", "03": "Mars", "04": "Avril",
  "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Aout",
  "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Decembre",
};

function fmtPeriod(p: string) { const [y, m] = p.split("-"); return `${MONTHS[m] || m} ${y}`; }
function fmtLU(n: number | undefined) { return (n ?? 0).toLocaleString("fr-LU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function PayslipPreview() {
  const { employees, selectedEmployeeId, company, results, period, maladieHours, savePayslip } = usePayrollStore();
  const emp = employees.find((e) => e.id === selectedEmployeeId);
  const [saved, setSaved] = useState(false);

  if (!results || !emp || results.salaryBrut === 0) return null;

  const [year, month] = period.split("-").map(Number);
  const JO = getWorkingDays(year, month);
  const JC = getCalendarDays(year, month);

  const onPDF = () => generatePayslipPDF(emp, company, results, period);
  const onXML = () => generateCCSSXML(emp, company, results, period);
  const onSave = () => { savePayslip(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Decompte salaire / traitement
        </h3>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={onSave} className={`h-8 gap-1 text-[11px] sm:h-7 ${saved ? "border-emerald-300 bg-emerald-50 text-emerald-700" : ""}`}>
            {saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
            <span className="hidden xs:inline">{saved ? "OK" : "Sauvegarder"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onXML} className="h-8 gap-1 text-[11px] sm:h-7">
            <FileCode className="h-3 w-3" /> XML
          </Button>
          <Button size="sm" onClick={onPDF} className="h-8 gap-1 bg-indigo-600 text-[11px] hover:bg-indigo-700 sm:h-7">
            <Download className="h-3 w-3" /> PDF
          </Button>
        </div>
      </div>

      {/* Document — scrollable on small screens */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm font-mono text-xs">
        <div className="min-w-[600px]">
        {/* ── Header: Title + Company ── */}
        <div className="grid grid-cols-2 border-b border-slate-300">
          <div className="border-r border-slate-300 p-4">
            <p className="text-center text-[13px] font-bold uppercase tracking-wider text-slate-900">
              Decompte Salaire / Traitement
            </p>
            <p className="mt-2 text-center font-sans text-sm font-semibold text-slate-700">{fmtPeriod(period).toUpperCase()}</p>
            <div className="mt-3 text-center text-[10px] text-slate-500 space-y-0.5">
              <p>Indice : <span className="font-semibold text-slate-700">{results.index.toFixed(2)}</span></p>
              <p className="font-bold text-slate-600">JO : {JO} &ndash; JC : {JC} &ndash; JI : {JO}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="font-sans text-sm font-bold text-slate-900">{company.name || "Entreprise"}</p>
            <p className="mt-1 text-[10px] text-slate-500">{company.address || "—"}</p>
            <p className="text-[10px] text-slate-500">{company.city || "—"}</p>
            {company.tva && <p className="mt-1 text-[10px] text-slate-400">TVA: {company.tva}</p>}
          </div>
        </div>

        {/* ── Employee details + Name ── */}
        <div className="grid grid-cols-2 border-b border-slate-300">
          <div className="border-r border-slate-300 p-4 text-[10px] text-slate-600 space-y-0.5">
            <Row2 label="Matricule" value={emp.ssn || "—"} />
            <Row2 label="N° Securite Sociale" value={emp.numSecSociale || "—"} />
            <Row2 label="Date d'entree" value={emp.entryDate ? new Date(emp.entryDate).toLocaleDateString("fr-LU") : "—"} />
            <Row2 label="Date d'anciennete" value={emp.dateAnciennete ? new Date(emp.dateAnciennete).toLocaleDateString("fr-LU") : "—"} />
            <div className="h-1" />
            <Row2 label="Degre d'occupation" value={`${emp.degreeOccupation.toFixed(2)} / ${emp.degreeOccupation.toFixed(2)}`} />
            <Row2 label="Mensuel" value={fmtLU(results.salaireBase)} bold />
          </div>
          <div className="p-4">
            <p className="font-sans text-sm font-bold text-slate-900">{emp.name || "—"}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">{emp.role || "—"}</p>
            <p className="mt-2 text-[10px] text-slate-400">Classe d'impot: {emp.taxClass}</p>
          </div>
        </div>

        {/* ── Main Table ── */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-50 text-[9px] uppercase tracking-wider text-slate-500">
              <th className="px-3 py-1.5 text-left w-12">Code</th>
              <th className="px-3 py-1.5 text-left">Libelle</th>
              <th className="px-3 py-1.5 text-right w-20">Nb. Heures</th>
              <th className="px-3 py-1.5 text-right w-20">Taux</th>
              <th className="px-3 py-1.5 text-right w-24">Montant</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {/* Brut mensuel */}
            <tr className="border-b border-slate-100">
              <td className="px-3 py-1.5"></td>
              <td className="px-3 py-1.5 font-sans font-semibold text-slate-800">BRUT MENSUEL</td>
              <td className="px-3 py-1.5 text-right">{results.heuresTotales.toFixed(2)}</td>
              <td className="px-3 py-1.5 text-right"></td>
              <td className="px-3 py-1.5 text-right font-semibold">{fmtLU(results.salaireBase)}</td>
            </tr>

            {/* Overtime */}
            {results.heuresSupp > 0 && (
              <tr className="border-b border-slate-100 text-indigo-700">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 font-sans">Heures supplementaires</td>
                <td className="px-3 py-1.5 text-right">{results.heuresSupp.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right">{results.tauxHoraire.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right font-semibold">{fmtLU(results.montantHeuresSupp)}</td>
              </tr>
            )}

            {/* Total brut */}
            <tr className="border-b border-slate-300 bg-slate-50">
              <td className="px-3 py-1.5" colSpan={3}></td>
              <td className="px-3 py-1.5 text-right font-sans font-bold text-slate-700">Total brut</td>
              <td className="px-3 py-1.5 text-right font-bold text-slate-900">{fmtLU(results.salaryBrut)}</td>
            </tr>

            {/* Spacer */}
            <tr><td colSpan={5} className="h-1"></td></tr>

            {/* Cotisations */}
            <TaxRow label="Caisse Maladie Soins 2,8000%" base={results.salaryBrut} amount={results.maladieSoins} />
            <TaxRow label="Caisse Maladie Especes 0,2500%" base={results.salaryBrut} amount={results.maladieEspeces} />
            <TaxRow label="Caisse Pension 8,0000%" base={results.salaryBrut} amount={results.pension} />
            <TaxRow label="Caisse Dependance 1,4000%" base={results.dependanceBase} amount={results.dependance} />

            <tr className="border-b border-slate-300">
              <td className="px-3 py-1.5" colSpan={2}><span className="font-sans text-slate-600">Total des Cotisations Sociales</span></td>
              <td colSpan={2}></td>
              <td className="px-3 py-1.5 text-right font-semibold text-red-600">-{fmtLU(results.totalSocial)}</td>
            </tr>

            {/* Déduction fiche */}
            <tr className="border-b border-slate-100">
              <td className="px-3 py-1.5"></td>
              <td className="px-3 py-1.5 font-sans font-semibold text-slate-700">Deduction Fiche</td>
              <td className="px-3 py-1.5 text-right text-slate-400">Code FD</td>
              <td className="px-3 py-1.5 text-right">{fmtLU(results.deductionFiche)}</td>
              <td></td>
            </tr>

            {/* Total imposable */}
            <tr className="border-b border-slate-100">
              <td className="px-3 py-1.5" colSpan={2}><span className="font-sans text-slate-600 pl-4">Total Imposable</span></td>
              <td></td>
              <td className="px-3 py-1.5 text-right font-semibold text-slate-800">{fmtLU(results.totalImposable)}</td>
              <td></td>
            </tr>

            {/* Impôt (single line, matching real LU payslip) */}
            <tr className="border-b border-slate-100">
              <td className="px-3 py-1.5" colSpan={2}><span className="font-sans text-slate-700 pl-4">Impot</span></td>
              <td colSpan={2}></td>
              <td className="px-3 py-1.5 text-right text-red-600">-{fmtLU(results.impots)}</td>
            </tr>

            {/* Credits (shown as positive values, reduce tax internally) */}
            {results.CIS > 0 && <CreditRow2 label="Credit d'impots" amount={results.CIS} />}
            {results.CIP > 0 && <CreditRow2 label="Credit d'impots (CIP)" amount={results.CIP} />}
            {results.CIM > 0 && <CreditRow2 label="Credit d'impots (CIM)" amount={results.CIM} />}
            {results.CICO2 > 0 && <CreditRow2 label="CI-CO2" amount={results.CICO2} />}
            {results.CISSM > 0 && <CreditRow2 label="Credit d'Impots Salaire minimum" amount={results.CISSM} />}

            {/* Net */}
            <tr className="border-b border-slate-300 bg-slate-50">
              <td colSpan={3}></td>
              <td className="px-3 py-1.5 text-right font-sans font-bold text-slate-700">Net</td>
              <td className="px-3 py-1.5 text-right font-bold text-slate-900">{fmtLU(results.net)}</td>
            </tr>

            {/* Frais / Cheques */}
            {results.fraisDeplacement > 0 && (
              <tr className="border-b border-slate-100">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 font-sans text-slate-600">Frais de deplacement</td>
                <td colSpan={2}></td>
                <td className="px-3 py-1.5 text-right text-emerald-700">{fmtLU(results.fraisDeplacement)}</td>
              </tr>
            )}
            {results.autresAvantages > 0 && (
              <tr className="border-b border-slate-100">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 font-sans text-slate-600">Autres avantages</td>
                <td colSpan={2}></td>
                <td className="px-3 py-1.5 text-right text-emerald-700">{fmtLU(results.autresAvantages)}</td>
              </tr>
            )}
            {results.chequesRepas > 0 && (
              <tr className="border-b border-slate-100">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 font-sans text-slate-600">- CHEQUES REPAS</td>
                <td colSpan={2}></td>
                <td className="px-3 py-1.5 text-right text-red-600">-{fmtLU(results.chequesRepas)}</td>
              </tr>
            )}
            {results.autresDeductions > 0 && (
              <tr className="border-b border-slate-100">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5 font-sans text-slate-600">- Autres deductions</td>
                <td colSpan={2}></td>
                <td className="px-3 py-1.5 text-right text-red-600">-{fmtLU(results.autresDeductions)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── NET A PAYER ── */}
        <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
          <span className="font-sans text-sm font-bold tracking-wider">NET A PAYER</span>
          <span className="text-lg font-bold">{fmtLU(results.netAPayer)}</span>
        </div>

        {/* ── Annual totals ── */}
        <div className="border-t border-slate-300 bg-slate-50 p-4">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Total annuel jusqu'au {new Date(year, month - 1, JC).toLocaleDateString("fr-LU")} inclus
          </p>
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-[10px] text-slate-500">
            <span>Brut: <b className="text-slate-700">{fmtLU(results.salaryBrut)}</b></span>
            <span>Cotis: <b className="text-slate-700">{fmtLU(results.totalSocial)}</b></span>
            <span>Impos.: <b className="text-slate-700">{fmtLU(results.totalImposable)}</b></span>
            <span>Impot: <b className="text-slate-700">{fmtLU(results.impots)}</b></span>
            <span>CIS: <b className="text-slate-700">{fmtLU(results.CIS)}</b></span>
            <span>Net: <b className="text-slate-700">{fmtLU(results.net)}</b></span>
            <span>A PAYER: <b className="text-emerald-700">{fmtLU(results.netAPayer)}</b></span>
          </div>
        </div>

        {/* ── Situation des congés (tabela como referência) ── */}
        <div className="border-t border-slate-300 bg-white p-4">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Situation des congés
          </p>
          <CongesTable emp={emp} tauxHoraire={results.tauxHoraire} />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-500">
            <span>Feries: {emp.feriados ?? 0} h</span>
            <span>Récup.: {emp.recuperation ?? 0} h</span>
            <span>Repos: {emp.repos ?? 0} h</span>
            <span className={emp.maladieHeures > 0 ? "font-semibold text-amber-600" : ""}>Maladie: {emp.maladieHeures ?? 0} h</span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-200 py-2 text-center text-[8px] uppercase tracking-widest text-slate-300">
          LuxPayroll 2026 &middot; Simulation indicative &middot; Grand-Duche de Luxembourg
        </div>
      </div>{/* close min-w-[600px] */}
      </div>{/* close overflow-x-auto */}
    </div>
  );
}

function Row2({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={bold ? "font-bold text-slate-800" : ""}>{value}</span>
    </div>
  );
}

function TaxRow({ label, base, amount }: { label: string; base: number; amount: number }) {
  return (
    <tr className="border-b border-slate-100 text-slate-600">
      <td className="px-3 py-1"></td>
      <td className="px-3 py-1 font-sans text-[10px]">{label}</td>
      <td></td>
      <td className="px-3 py-1 text-right text-slate-400">{fmtLU(base)}</td>
      <td className="px-3 py-1 text-right">{fmtLU(amount)}</td>
    </tr>
  );
}

function CreditRow2({ label, amount }: { label: string; amount: number }) {
  return (
    <tr className="border-b border-slate-100 text-emerald-700">
      <td className="px-3 py-1" colSpan={2}><span className="font-sans pl-4">{label}</span></td>
      <td colSpan={2}></td>
      <td className="px-3 py-1 text-right font-semibold">{fmtLU(amount)}</td>
    </tr>
  );
}

function CongesTable({ emp, tauxHoraire }: { emp: { congesReport?: number; congesAnnuels?: number; congesPris?: number; recuperation?: number }; tauxHoraire: number }) {
  const report = emp.congesReport ?? 0;
  const droit = emp.congesAnnuels ?? 208;
  const pris = emp.congesPris ?? 0;
  const solde = Math.max(0, report + droit - pris);
  const recup = emp.recuperation ?? 0;

  const toEur = (h: number) => (h * tauxHoraire).toFixed(2);

  const rows = [
    { label: "Mensuel", report: report / 12, droit: droit / 12, pris: pris / 12, solde: solde / 12 },
    { label: "Annuel", report, droit, pris, solde },
    ...(recup > 0 ? [{ label: "Récup.", report: 0, droit: recup, pris: 0, solde: recup }] : []),
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50">
      <table className="w-full min-w-[400px] text-[10px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100/80">
            <th className="px-3 py-2 text-left font-semibold text-slate-600"></th>
            <th className="px-2 py-2 text-right font-semibold text-slate-600">Report</th>
            <th className="px-2 py-2 text-right font-semibold text-slate-600">Droit</th>
            <th className="px-2 py-2 text-right font-semibold text-slate-600">Pris</th>
            <th className="px-2 py-2 text-right font-semibold text-emerald-700">Solde</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-2 font-medium text-slate-600">{r.label}</td>
              <td className="px-2 py-2 text-right font-mono">
                <span className="text-slate-700">{r.report.toFixed(2)} h</span>
                <span className="ml-1 text-slate-400">{toEur(r.report)} €</span>
              </td>
              <td className="px-2 py-2 text-right font-mono">
                <span className="text-slate-700">{r.droit.toFixed(2)} h</span>
                <span className="ml-1 text-slate-400">{toEur(r.droit)} €</span>
              </td>
              <td className="px-2 py-2 text-right font-mono">
                <span className="text-slate-700">{r.pris.toFixed(2)} h</span>
                <span className="ml-1 text-slate-400">{toEur(r.pris)} €</span>
              </td>
              <td className="px-2 py-2 text-right font-mono font-bold text-emerald-700">
                <span>{r.solde.toFixed(2)} h</span>
                <span className="ml-1">{toEur(r.solde)} €</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
