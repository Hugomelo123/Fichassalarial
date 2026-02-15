import { create } from "zustand";
import {
  calculateLuxSalary,
  PayrollResult,
  STANDARD_MONTHLY_HOURS,
} from "../utils/calculations";

export interface EmployeeData {
  name: string;
  role: string;
  ssn: string;
  entryDate: string;
  taxClass: string;
}

export interface CompanyData {
  name: string;
  address: string;
  tva: string;
}

export type SalaryMode = "monthly" | "hourly";

interface PayrollState {
  // --- Data ---
  employee: EmployeeData;
  company: CompanyData;

  // Salary
  salaryMode: SalaryMode;
  monthlyGross: number;
  hourlyRate: number;
  hoursWorked: number;

  // Absences
  maladieHours: number;

  // Period
  period: string; // e.g. "2026-02"

  // Results
  results: PayrollResult | null;

  // --- Actions ---
  setEmployee: (data: Partial<EmployeeData>) => void;
  setCompany: (data: Partial<CompanyData>) => void;
  setSalaryMode: (mode: SalaryMode) => void;
  setMonthlyGross: (v: number) => void;
  setHourlyRate: (v: number) => void;
  setHoursWorked: (v: number) => void;
  setMaladieHours: (v: number) => void;
  setPeriod: (v: string) => void;
  recalculate: () => void;
}

function buildInput(state: PayrollState) {
  return {
    salaryMode: state.salaryMode,
    monthlyGross: state.monthlyGross,
    hourlyRate: state.hourlyRate,
    hoursWorked: state.hoursWorked,
    maladieHours: state.maladieHours,
    taxClass: state.employee.taxClass,
  };
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  employee: {
    name: "",
    role: "",
    ssn: "",
    entryDate: "",
    taxClass: "1",
  },
  company: {
    name: "",
    address: "",
    tva: "",
  },

  salaryMode: "monthly",
  monthlyGross: 0,
  hourlyRate: 0,
  hoursWorked: STANDARD_MONTHLY_HOURS,
  maladieHours: 0,
  period: "2026-02",
  results: null,

  setEmployee: (data) => {
    const employee = { ...get().employee, ...data };
    set({ employee });
    // Recalculate if tax class changed
    const results = calculateLuxSalary({ ...buildInput({ ...get(), employee }), taxClass: employee.taxClass });
    set({ results });
  },

  setCompany: (data) => set({ company: { ...get().company, ...data } }),

  setSalaryMode: (salaryMode) => {
    set({ salaryMode });
    const state = get();
    set({ results: calculateLuxSalary(buildInput({ ...state, salaryMode })) });
  },

  setMonthlyGross: (monthlyGross) => {
    set({ monthlyGross });
    const state = get();
    set({ results: calculateLuxSalary(buildInput({ ...state, monthlyGross })) });
  },

  setHourlyRate: (hourlyRate) => {
    set({ hourlyRate });
    const state = get();
    set({ results: calculateLuxSalary(buildInput({ ...state, hourlyRate })) });
  },

  setHoursWorked: (hoursWorked) => {
    set({ hoursWorked });
    const state = get();
    set({ results: calculateLuxSalary(buildInput({ ...state, hoursWorked })) });
  },

  setMaladieHours: (maladieHours) => {
    set({ maladieHours });
    const state = get();
    set({ results: calculateLuxSalary(buildInput({ ...state, maladieHours })) });
  },

  setPeriod: (period) => set({ period }),

  recalculate: () => {
    const state = get();
    set({ results: calculateLuxSalary(buildInput(state)) });
  },
}));
