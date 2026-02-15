import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  calculateLuxSalary,
  defaultCIS,
  LUX,
  type PayrollInput,
  type PayrollResult,
} from "../utils/calculations";

/* ─── Types ─── */

export interface Employee {
  id: string;
  name: string;
  role: string;
  ssn: string;            // matricule
  numSecSociale: string;  // N° Sécurité Sociale
  entryDate: string;
  dateAnciennete: string;
  taxClass: string;

  salaryMode: "monthly" | "hourly";
  monthlyGross: number;
  hourlyRate: number;
  hoursWorked: number;
  degreeOccupation: number; // h/week (default 40)

  // Overtime
  overtimeHours: number;
  overtimeRate: number; // multiplier (default 1.4)

  // Avantages & Déductions
  fraisDeplacement: number;
  chequesRepas: number;
  autresAvantages: number;
  autresDeductions: number;

  // Fiscal credits
  CIS: number;
  CIP: number;
  CIM: number;
  CISSM: number;
  CICO2: number;

  // Index
  index: number;

  // Leave tracking (annual counters — in HOURS)
  congesAnnuels: number;  // total annual leave hours
  congesPris: number;     // leave hours taken
  feriados: number;       // public holidays hours
  recuperation: number;   // recovery hours
  repos: number;          // rest hours
  maladieHeures: number;  // sick leave hours (annual)
}

export interface CompanyData {
  name: string;
  address: string;
  city: string;
  tva: string;
}

export interface SavedPayslip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  salaryBrut: number;
  net: number;
  netAPayer: number;
  maladieHours: number;
  results: PayrollResult;
  createdAt: string;
}

export type AppView = "simulator" | "history" | "dashboard";

/* ─── State ─── */

interface PayrollState {
  view: AppView;
  setView: (v: AppView) => void;

  company: CompanyData;
  setCompany: (data: Partial<CompanyData>) => void;

  employees: Employee[];
  selectedEmployeeId: string | null;
  addEmployee: (name?: string) => void;
  removeEmployee: (id: string) => void;
  selectEmployee: (id: string) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;

  maladieHours: number;
  setMaladieHours: (v: number) => void;
  period: string;
  setPeriod: (v: string) => void;

  results: PayrollResult | null;
  recalculate: () => void;

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
    numSecSociale: "",
    entryDate: "",
    dateAnciennete: "",
    taxClass: "1",
    salaryMode: "monthly",
    monthlyGross: 0,
    hourlyRate: 0,
    hoursWorked: LUX.standardMonthlyHours,
    degreeOccupation: 40,
    overtimeHours: 0,
    overtimeRate: 1.4,
    fraisDeplacement: 0,
    chequesRepas: 0,
    autresAvantages: 0,
    autresDeductions: 0,
    CIS: defaultCIS("1"),
    CIP: 0,
    CIM: 0,
    CISSM: 0,
    CICO2: 0,
    index: LUX.index,
    congesAnnuels: 208, // 26 days * 8h
    congesPris: 0,
    feriados: 0,
    recuperation: 0,
    repos: 0,
    maladieHeures: 0,
  };
}

function buildInput(emp: Employee, maladieHours: number): PayrollInput {
  return {
    salaryMode: emp.salaryMode,
    monthlyGross: emp.monthlyGross,
    hourlyRate: emp.hourlyRate,
    hoursWorked: emp.hoursWorked,
    maladieHours,
    overtimeHours: emp.overtimeHours,
    overtimeRate: emp.overtimeRate,
    taxClass: emp.taxClass,
    CIS: emp.CIS,
    CIP: emp.CIP,
    CIM: emp.CIM,
    CISSM: emp.CISSM,
    CICO2: emp.CICO2,
    fraisDeplacement: emp.fraisDeplacement,
    chequesRepas: emp.chequesRepas,
    autresAvantages: emp.autresAvantages,
    autresDeductions: emp.autresDeductions,
    index: emp.index,
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
      view: "simulator",
      setView: (view) => set({ view }),

      company: { name: "", address: "", city: "", tva: "" },
      setCompany: (data) => set({ company: { ...get().company, ...data } }),

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
        if (get().selectedEmployeeId === id) {
          const emp = employees.find((e) => e.id === id);
          set({ results: calcForEmployee(emp, get().maladieHours) });
        }
      },

      maladieHours: 0,
      setMaladieHours: (maladieHours) => {
        set({ maladieHours });
        const emp = get().employees.find((e) => e.id === get().selectedEmployeeId);
        set({ results: calcForEmployee(emp, maladieHours) });
      },

      period: "2026-02",
      setPeriod: (period) => set({ period }),

      results: null,
      recalculate: () => {
        const emp = get().employees.find((e) => e.id === get().selectedEmployeeId);
        set({ results: calcForEmployee(emp, get().maladieHours) });
      },

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
          netAPayer: results.netAPayer,
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
      version: 4, // bumped for CICO2 + hours-based leave
    },
  ),
);
