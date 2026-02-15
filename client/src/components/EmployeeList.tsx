import { usePayrollStore } from "@/store/usePayrollStore";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2, User, Check } from "lucide-react";

export default function EmployeeList() {
  const { employees, selectedEmployeeId, addEmployee, selectEmployee, removeEmployee } =
    usePayrollStore();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <User className="h-4 w-4" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            Salaries ({employees.length})
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addEmployee()}
          className="h-7 gap-1 text-[11px]"
        >
          <UserPlus className="h-3 w-3" />
          Ajouter
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-200 py-6 text-center">
          <User className="mx-auto mb-2 h-6 w-6 text-slate-300" />
          <p className="text-xs text-slate-400">Aucun salarie enregistre.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addEmployee()}
            className="mt-2 h-7 gap-1 text-[11px] text-indigo-600"
          >
            <UserPlus className="h-3 w-3" />
            Ajouter un salarie
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {employees.map((emp) => {
            const isSelected = emp.id === selectedEmployeeId;
            return (
              <div
                key={emp.id}
                onClick={() => selectEmployee(emp.id)}
                className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-all ${
                  isSelected
                    ? "bg-indigo-50 ring-1 ring-indigo-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {emp.name ? emp.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-medium ${
                        isSelected ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {emp.name || "Sans nom"}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {emp.role || "Fonction non definie"}
                      {emp.salaryMode === "hourly" && " · Horaire"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-indigo-500" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEmployee(emp.id);
                    }}
                    className="rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
