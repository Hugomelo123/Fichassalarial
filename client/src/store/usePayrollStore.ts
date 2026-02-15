import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  calculateLuxSalary,
  PayrollResult,
  STANDARD_MONTHLY_HOURS,
  type PayrollInput,
} from "../utils/calculations";

/* ─── Types ─── */

export interface Employee {
  id: string;
  name: string;
  role: string;
  ssn: string;
  entryDate: string;
  taxClass: string;
  salaryMode: "monthly" | "hourly";
  monthlyGross: number;
  hourlyRate: number;
  hoursWorked: number;
}

export interface CompanyData {
  name: string;
  address: string;
  tva: string;
}

export interface SavedPayslip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  salaryBrut: number;
  net: number;
  maladieHours: number;
  results: PayrollResult;
  createdAt: string;
}

export type AppView = "simulator" | "history" | "dashboard";

/* ─── State ─── */

interface PayrollState {
  // Navigation
  view: AppView;
  setView: (v: AppView) => void;

  // Company
  company: CompanyData;
  setCompany: (data: Partial<CompanyData>) => void;

  // Employees
  employees: Employee[];
  selectedEmployeeId: string | null;
  addEmployee: (name?: string) => void;
  removeEmployee: (id: string) => void;
  selectEmployee: (id: string) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;

  // Current simulation
  maladieHours: number;
  setMaladieHours: (v: number) => void;
  period: string;
  setPeriod: (v: string) => void;

  // Results (live)
  results: PayrollResult | null;
  recalculate: () => void;

  // Payslip history
  payslips: SavedPayslip[];
  savePayslip: () => void;
  deletePayslip: (id: string) => void;
}

/* ─── Helpers ─── */

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createEmptyEmployee(name?: string): Employee {
  return {
    id: uid(),
    name: name || "",
    role: "",
    ssn: "",
    entryDate: "",
    taxClass: "1",
    salaryMode: "monthly",
    monthlyGross: 0,
    hourlyRate: 0,
    hoursWorked: STANDARD_MONTHLY_HOURS,
  };
}

function buildInput(emp: Employee, maladieHours: number): PayrollInput {
  return {
    salaryMode: emp.salaryMode,
    monthlyGross: emp.monthlyGross,
    hourlyRate: emp.hourlyRate,
    hoursWorked: emp.hoursWorked,
    maladieHours,
    taxClass: emp.taxClass,
  };
}

function calcForEmployee(emp: Employee | undefined, maladieHours: number): PayrollResult | null {
  if (!emp) return null;
  const input = buildInput(emp, maladieHours);
  const hasSalary =
    emp.salaryMode === "monthly" ? emp.monthlyGross > 0 : emp.hourlyRate > 0 && emp.hoursWorked > 0;
  if (!hasSalary) return null;
  return calculateLuxSalary(input);
}

/* ─── Store ─── */

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      // --- Navigation ---
      view: "simulator",
      setView: (view) => set({ view }),

      // --- Company ---
      company: { name: "", address: "", tva: "" },
      setCompany: (data) => set({ company: { ...get().company, ...data } }),

      // --- Employees ---
      employees: [],
      selectedEmployeeId: null,

      addEmployee: (name) => {
        const emp = createEmptyEmployee(name);
        const employees = [...get().employees, emp];
        set({ employees, selectedEmployeeId: emp.id, results: null, maladieHours: 0 });
      },

      removeEmployee: (id) => {
        const employees = get().employees.filter((e) => e.id !== id);
        const sel = get().selectedEmployeeId === id
          ? (employees[0]?.id ?? null)
          : get().selectedEmployeeId;
        const emp = employees.find((e) => e.id === sel);
        set({
          employees,
          selectedEmployeeId: sel,
          results: calcForEmployee(emp, 0),
          maladieHours: 0,
        });
      },

      selectEmployee: (id) => {
        const emp = get().employees.find((e) => e.id === id);
        set({
          selectedEmployeeId: id,
          maladieHours: 0,
          results: calcForEmployee(emp, 0),
        });
      },

      updateEmployee: (id, data) => {
        const employees = get().employees.map((e) =>
          e.id === id ? { ...e, ...data } : e,
        );
        set({ employees });
        // Recalculate if this is the selected employee
        if (get().selectedEmployeeId === id) {
          const emp = employees.find((e) => e.id === id);
          set({ results: calcForEmployee(emp, get().maladieHours) });
        }
      },

      // --- Current simulation ---
      maladieHours: 0,
      setMaladieHours: (maladieHours) => {
        set({ maladieHours });
        const emp = get().employees.find((e) => e.id === get().selectedEmployeeId);
        set({ results: calcForEmployee(emp, maladieHours) });
      },

      period: "2026-02",
      setPeriod: (period) => set({ period }),

      // --- Results ---
      results: null,
      recalculate: () => {
        const emp = get().employees.find((e) => e.id === get().selectedEmployeeId);
        set({ results: calcForEmployee(emp, get().maladieHours) });
      },

      // --- Payslip history ---
      payslips: [],

      savePayslip: () => {
        const { selectedEmployeeId, employees, results, period, maladieHours } = get();
        const emp = employees.find((e) => e.id === selectedEmployeeId);
        if (!emp || !results) return;

        const payslip: SavedPayslip = {
          id: uid(),
          employeeId: emp.id,
          employeeName: emp.name || "Sans nom",
          period,
          salaryBrut: results.salaryBrut,
          net: results.net,
          maladieHours,
          results,
          createdAt: new Date().toISOString(),
        };
        set({ payslips: [payslip, ...get().payslips] });
      },

      deletePayslip: (id) => {
        set({ payslips: get().payslips.filter((p) => p.id !== id) });
      },
    }),
    {
      name: "luxpayroll-store",
      version: 2,
    },
  ),
);
