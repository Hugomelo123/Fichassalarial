import { usePayrollStore, type SavedPayslip } from "@/store/usePayrollStore";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Calendar, ArrowLeft } from "lucide-react";

const MONTHS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Aou",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return `${MONTHS[month] || month} ${year}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-LU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PayslipHistory() {
  const { payslips, deletePayslip, employees, setView } = usePayrollStore();

  // Group by employee
  const grouped = payslips.reduce<Record<string, SavedPayslip[]>>((acc, p) => {
    const key = p.employeeId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const employeeIds = Object.keys(grouped);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Historique des fiches
          </h2>
          <p className="text-xs text-slate-400">
            {payslips.length} fiche{payslips.length !== 1 ? "s" : ""} enregistree{payslips.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView("simulator")}
          className="h-8 gap-1.5 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          Simulateur
        </Button>
      </div>

      {payslips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-slate-200" />
          <p className="text-sm text-slate-400">Aucune fiche sauvegardee.</p>
          <p className="mt-1 text-xs text-slate-300">
            Generez une fiche dans le simulateur puis cliquez "Sauvegarder".
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {employeeIds.map((empId) => {
            const emp = employees.find((e) => e.id === empId);
            const slips = grouped[empId];
            return (
              <div key={empId} className="rounded-xl border bg-white shadow-sm">
                {/* Employee header */}
                <div className="flex items-center gap-3 border-b bg-slate-50/60 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {(emp?.name || slips[0]?.employeeName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {emp?.name || slips[0]?.employeeName || "Employe supprime"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {slips.length} fiche{slips.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Payslip list */}
                <div className="divide-y divide-slate-100">
                  {slips.map((slip) => (
                    <div
                      key={slip.id}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                          <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {formatPeriod(slip.period)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Cree le {formatDate(slip.createdAt)}
                            {slip.maladieHours > 0 && (
                              <span className="ml-2 text-amber-500">
                                · {slip.maladieHours}h maladie
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">Brut</p>
                          <p className="font-mono text-xs text-slate-600">
                            {slip.salaryBrut.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-500">Net</p>
                          <p className="font-mono text-sm font-bold text-emerald-700">
                            {slip.net.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => deletePayslip(slip.id)}
                          className="rounded p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
