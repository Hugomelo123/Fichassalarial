import React from "react";
import { usePayrollStore } from "@/store/usePayrollStore";
import { Button } from "@/components/ui/button";
import { Download, Printer, FileCode } from "lucide-react";
import { generatePayslipPDF } from "@/utils/generatePDF";
import { generateCCSSXML } from "@/utils/generateXML";

export default function PayslipPreview() {
  const { employee, company, results, salaryBrut } = usePayrollStore();

  const handleDownloadPDF = () => {
    if (results) {
      generatePayslipPDF(employee, company, results);
    }
  };

  const handleDownloadXML = () => {
    if (results) {
      generateCCSSXML(employee, company, results);
    }
  };

  if (!results) return (
    <div className="h-full flex items-center justify-center text-slate-400 border rounded-xl bg-slate-50/50 p-12 text-center">
      <div>
        <FileCode className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Entrez les données à gauche pour générer la fiche de paie.</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm sticky top-0 z-10">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileCode className="h-5 w-5 text-blue-600" />
          Aperçu Fiche
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden md:flex">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadXML} className="hidden md:flex">
            <FileCode className="h-4 w-4 mr-2" />
            XML CCSS
          </Button>
          <Button size="sm" onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white border shadow-md p-8 font-serif text-sm relative overflow-hidden text-slate-900 mx-auto max-w-[210mm] w-full min-h-[297mm]" id="payslip-preview">
        {/* Paper texture effect */}
        <div className="absolute inset-0 bg-slate-50 opacity-10 pointer-events-none"></div>

        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-slate-100 text-9xl font-bold uppercase pointer-events-none select-none z-0">
          Spécimen
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="text-center mb-12 border-b-2 border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-widest mb-2">Fiche de Rémunération</h1>
            <p className="text-slate-500 font-sans text-sm uppercase tracking-wide">Période de référence: <span className="font-bold text-slate-900">Février 2026</span></p>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-16 mb-12 font-sans">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 border-b pb-2">Employeur</h4>
              <div className="font-bold text-lg text-slate-900">{company.name}</div>
              <div className="whitespace-pre-line text-slate-600 mt-1 text-sm">{company.address}</div>
              <div className="text-xs text-slate-400 mt-4 font-mono bg-white inline-block px-2 py-1 rounded border">TVA: {company.tva}</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-right">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 border-b pb-2">Bénéficiaire</h4>
              <div className="font-bold text-lg text-slate-900">{employee.name || "Salarié Inconnu"}</div>
              <div className="text-slate-600 mt-1 text-sm">{employee.role || "Fonction non définie"}</div>
              <div className="flex justify-end gap-2 mt-4">
                 <div className="text-xs text-slate-500 font-mono bg-white px-2 py-1 rounded border">Matricule: {employee.ssn || "N/A"}</div>
                 <div className="text-xs text-slate-500 font-mono bg-white px-2 py-1 rounded border">Classe: {employee.taxClass || "1"}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full border border-slate-300 mb-8 rounded-lg overflow-hidden font-sans">
            <div className="grid grid-cols-12 py-3 border-b border-slate-300 font-bold bg-slate-100 text-xs uppercase tracking-wider text-slate-700">
              <div className="col-span-6 pl-4">Description</div>
              <div className="col-span-2 text-center">Base</div>
              <div className="col-span-2 text-center">Taux</div>
              <div className="col-span-2 text-right pr-4">Montant (€)</div>
            </div>

            {/* Lines */}
            <div className="text-sm">
              {/* Gross */}
              <div className="grid grid-cols-12 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="col-span-6 pl-4 font-semibold text-slate-800">Salaire de base mensuel</div>
                <div className="col-span-2 text-center text-slate-400">-</div>
                <div className="col-span-2 text-center text-slate-400">-</div>
                <div className="col-span-2 text-right pr-4 font-mono">{(salaryBrut).toFixed(2)}</div>
              </div>

              {/* Social */}
              <div className="grid grid-cols-12 py-3 border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors">
                <div className="col-span-6 pl-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Assurance Maladie / Soins
                </div>
                <div className="col-span-2 text-center text-slate-400">{salaryBrut.toFixed(2)}</div>
                <div className="col-span-2 text-center text-slate-500">2.80%</div>
                <div className="col-span-2 text-right pr-4 text-red-500 font-mono">
                  - {(salaryBrut * 0.028).toFixed(2)}
                </div>
              </div>
              
              <div className="grid grid-cols-12 py-3 border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors">
                <div className="col-span-6 pl-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Assurance Maladie (Espèces)
                </div>
                <div className="col-span-2 text-center text-slate-400">{salaryBrut.toFixed(2)}</div>
                <div className="col-span-2 text-center text-slate-500">0.25%</div>
                <div className="col-span-2 text-right pr-4 text-red-500 font-mono">
                  - {(salaryBrut * 0.0025).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-12 py-3 border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors">
                <div className="col-span-6 pl-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Assurance Pension
                </div>
                <div className="col-span-2 text-center text-slate-400">{salaryBrut.toFixed(2)}</div>
                <div className="col-span-2 text-center text-slate-500">8.00%</div>
                <div className="col-span-2 text-right pr-4 text-red-500 font-mono">
                  - {(salaryBrut * 0.08).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-12 py-3 border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors bg-slate-50/30">
                <div className="col-span-6 pl-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Assurance Dépendance
                </div>
                <div className="col-span-2 text-center text-slate-400">{((salaryBrut * 0.9975)).toFixed(2)}</div>
                <div className="col-span-2 text-center text-slate-500">1.40%</div>
                <div className="col-span-2 text-right pr-4 text-red-500 font-mono">
                  - {results.dependance.toFixed(2)}
                </div>
              </div>

              {/* Taxes */}
               <div className="grid grid-cols-12 py-3 border-b border-slate-100 text-slate-600 mt-4 hover:bg-slate-50 transition-colors">
                <div className="col-span-6 pl-4 font-medium text-slate-800">Impôt sur salaire (Retenue)</div>
                <div className="col-span-2 text-center text-slate-400">{results.totalImposable.toFixed(2)}</div>
                <div className="col-span-2 text-center text-slate-500">-</div>
                <div className="col-span-2 text-right pr-4 text-red-500 font-mono">
                  - {results.impots.toFixed(2)}
                </div>
              </div>
               <div className="grid grid-cols-12 py-3 border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors">
                <div className="col-span-6 pl-4 font-medium text-slate-800">Crédit d'Impôt (CIS/CISSM)</div>
                <div className="col-span-2 text-center text-slate-400">-</div>
                <div className="col-span-2 text-center text-slate-500">-</div>
                <div className="col-span-2 text-right pr-4 text-green-600 font-mono font-bold">
                  + {results.credit.toFixed(2)}
                </div>
              </div>

            </div>
          </div>

          {/* Totals */}
          <div className="mt-12 flex justify-end font-sans">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 w-80 shadow-sm">
              <div className="flex justify-between items-center text-sm mb-3 text-slate-500">
                <span>Total Retenues</span>
                <span className="font-mono text-red-400">- {(results.impots + results.totalSocial - results.credit).toFixed(2)} €</span>
              </div>
              <div className="border-t border-slate-300 my-3 border-dashed"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-slate-900 uppercase tracking-tight">NET A PAYER</span>
                <span className="font-mono text-2xl font-bold text-blue-700 bg-white px-3 py-1 rounded shadow-sm border border-blue-100">
                  € {results.net.toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-center text-slate-400 mt-4">
                Virement sur compte IBAN
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-slate-400 uppercase tracking-widest font-sans">
            Document généré automatiquement par LuxPayroll 2026 • Conforme à la législation luxembourgeoise en vigueur
          </div>
        </div>
      </div>
    </div>
  );
}
