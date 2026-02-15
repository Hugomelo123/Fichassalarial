import { create } from "zustand";
import { calculateLuxSalary, PayrollResult } from "../utils/calculations";

interface EmployeeData {
  name: string;
  role: string;
  ssn: string;
  entryDate: string;
  taxClass?: string;
}

interface CompanyData {
  name: string;
  address: string;
  tva: string;
}

interface PayrollState {
  employee: EmployeeData;
  company: CompanyData;
  salaryBrut: number;
  results: PayrollResult | null;

  setEmployee: (data: EmployeeData) => void;
  setCompany: (data: CompanyData) => void;
  setSalary: (salaryBrut: number) => void;
  calculate: () => void;
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  employee: {
    name: "",
    role: "",
    ssn: "",
    entryDate: "",
    taxClass: "1"
  },
  company: {
    name: "LuxCorp S.A.",
    address: "2, Rue du Fort Thüngen, L-1499 Luxembourg",
    tva: "LU12345678"
  },
  salaryBrut: 0,
  results: null,

  setEmployee: (data) => set({ employee: data }),
  setCompany: (data) => set({ company: data }),
  setSalary: (salaryBrut) => {
    set({ salaryBrut });
    // Auto-calculate when salary changes
    const results = calculateLuxSalary(salaryBrut);
    set({ results });
  },
  calculate: () => {
    const { salaryBrut } = get();
    const results = calculateLuxSalary(salaryBrut);
    set({ results });
  },
}));
