import { usePayrollStore, type SavedPayslip } from "@/store/usePayrollStore";
import { Trash2, Calendar, FileText, User } from "lucide-react";

const MO: Record<string, string> = {
  "01":"Jan","02":"Fev","03":"Mar","04":"Avr","05":"Mai","06":"Jun",
  "07":"Jul","08":"Aou","09":"Sep","10":"Oct","11":"Nov","12":"Dec",
};

function fmtP(p: string) { const [y, m] = p.split("-"); return `${MO[m]||m} ${y}`; }
function fmtD(iso: string) { return new Date(iso).toLocaleDateString("fr-LU",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); }

export default function PayslipHistory() {
  const { payslips, deletePayslip, employees, selectEmployee, setView } = usePayrollStore();

  const grouped = payslips.reduce<Record<string, SavedPayslip[]>>((a, p) => {
    (a[p.employeeId] ||= []).push(p);
    return a;
  }, {});

  const goToEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) { selectEmployee(emp.id); setView("simulator"); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fiches de paie</h1>
        <p className="text-sm text-slate-400">{payslips.length} fiche{payslips.length !== 1 ? "s" : ""} sauvegardee{payslips.length !== 1 ? "s" : ""}</p>
      </div>

      {payslips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <FileText className="mb-3 h-12 w-12 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">Aucune fiche sauvegardee</p>
          <p className="mt-1 text-xs text-slate-400">Generez une fiche dans le simulateur puis cliquez "Sauvegarder".</p>
          <button onClick={() => setView("simulator")} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
            Ouvrir le simulateur
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([empId, slips]) => {
          const emp = employees.find(e => e.id === empId);
          const total = slips.reduce((s, p) => s + (p.netAPayer || p.net), 0);
          return (
            <div key={empId} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col gap-2 bg-slate-50 px-4 py-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <button onClick={() => goToEmployee(empId)} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {(emp?.name || slips[0]?.employeeName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{emp?.name || slips[0]?.employeeName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{slips.length} fiche{slips.length > 1 ? "s" : ""} · Net total: {total.toLocaleString("fr-LU",{minimumFractionDigits:2})} EUR</p>
                  </div>
                </button>
                <button onClick={() => goToEmployee(empId)} className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 self-end sm:self-auto">
                  <User className="h-3 w-3" /> Voir salarie
                </button>
              </div>

              <div className="divide-y divide-slate-50">
                {slips.map((slip) => (
                  <div key={slip.id} className="flex flex-col gap-2 px-4 py-3 hover:bg-slate-50/50 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{fmtP(slip.period)}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {fmtD(slip.createdAt)}
                          {slip.maladieHours > 0 && <span className="ml-2 text-amber-500">· {slip.maladieHours}h maladie</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pl-[52px] sm:gap-5 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] uppercase text-slate-400">Brut</p>
                        <p className="font-mono text-xs text-slate-500">{slip.salaryBrut.toFixed(2)}</p>
                      </div>
                      <div className="text-left sm:text-right sm:min-w-[80px]">
                        <p className="text-[9px] uppercase text-emerald-500">Net a payer</p>
                        <p className="font-mono text-sm font-bold text-emerald-700">{(slip.netAPayer || slip.net).toFixed(2)}</p>
                      </div>
                      <button onClick={() => deletePayslip(slip.id)} className="ml-auto rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
