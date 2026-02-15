import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, ArrowRight } from "lucide-react";
import { usePayrollStore } from "@/store/usePayrollStore";

export default function SalaryBreakdown() {
  const { results, salaryBrut } = usePayrollStore();

  if (!results) {
    return (
      <Card className="bg-slate-50 border-dashed border-2">
        <CardContent className="h-40 flex flex-col items-center justify-center text-muted-foreground">
          <Calculator className="h-8 w-8 mb-2 opacity-50" />
          <p>Entrez un salaire brut pour voir le détail.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-t-4 border-t-green-600">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Résultat Net</span>
          <span className="text-2xl font-bold text-green-600 font-mono">
            € {results.net.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center font-medium">
            <span>Salaire Brut</span>
            <span>€ {salaryBrut.toFixed(2)}</span>
          </div>
          
          <div className="h-px bg-slate-200 my-2" />
          
          <div className="space-y-1 text-slate-600">
            <div className="flex justify-between items-center text-xs">
              <span>Cotisations Sociales (Employee)</span>
              <span className="text-red-500">- € {results.cotisations.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Assurance Dépendance (1.4%)</span>
              <span className="text-red-500">- € {results.dependance.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center font-medium pt-2 text-slate-700 bg-slate-50 p-2 rounded">
            <span>Total Imposable</span>
            <span>€ {results.totalImposable.toFixed(2)}</span>
          </div>

          <div className="space-y-1 text-slate-600 pt-2">
             <div className="flex justify-between items-center text-xs">
              <span>Impôts (Retenue à la source)</span>
              <span className="text-red-500">- € {results.impots.toFixed(2)}</span>
            </div>
             <div className="flex justify-between items-center text-xs">
              <span>Crédit d'impôt (CIS/CISSM)</span>
              <span className="text-green-600">+ € {results.credit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mt-4 border border-green-100">
          <div className="flex justify-between items-center text-green-800 font-bold">
            <span>NET À PAYER</span>
            <span className="text-xl">€ {results.net.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <span>Virement SEPA</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
