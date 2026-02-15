/** Luxembourg social contribution rates — 2026 */
export const RATES = {
  maladieSoins: 0.028,      // 2.80% — CNS soins de santé
  maladieEspeces: 0.0025,   // 0.25% — CNS indemnités pécuniaires
  pension: 0.08,             // 8.00% — CNAP
  dependance: 0.014,         // 1.40% — Assurance dépendance
} as const;

/** Standard working hours per month in Luxembourg (40h/week) */
export const STANDARD_MONTHLY_HOURS = 176;

export interface PayrollInput {
  salaryMode: "monthly" | "hourly";
  monthlyGross: number;
  hourlyRate: number;
  hoursWorked: number;
  maladieHours: number;
  taxClass: string;
}

export interface PayrollResult {
  salaryBrut: number;
  heuresNormales: number;
  heuresMaladie: number;
  heuresTotales: number;
  maladieSoins: number;
  maladieEspeces: number;
  pension: number;
  cotisations: number;
  dependance: number;
  totalSocial: number;
  totalImposable: number;
  impots: number;
  credit: number;
  net: number;
}

/**
 * Calculate Luxembourg payroll based on 2026 rates.
 *
 * Maladie hours: In Luxembourg the employer pays 100 % of the salary
 * for the first 77 calendar days of sick leave per reference period.
 * These hours are included in the gross but tracked separately.
 */
export function calculateLuxSalary(input: PayrollInput): PayrollResult {
  const { salaryMode, monthlyGross, hourlyRate, hoursWorked, maladieHours, taxClass } = input;

  // --- Gross salary ---
  let salaryBrut: number;
  let heuresNormales: number;
  let heuresMaladie = maladieHours;

  if (salaryMode === "hourly") {
    heuresNormales = Math.max(0, hoursWorked - maladieHours);
    // All hours (normal + maladie) are paid at the same rate
    salaryBrut = hourlyRate * hoursWorked;
  } else {
    salaryBrut = monthlyGross;
    // For monthly workers we still track hours for info
    const effectiveRate = monthlyGross > 0 ? monthlyGross / STANDARD_MONTHLY_HOURS : 0;
    heuresNormales = STANDARD_MONTHLY_HOURS - maladieHours;
    // Maladie doesn't change gross for monthly workers (employer continues to pay)
    void effectiveRate;
  }

  // --- Social contributions (part salariale) ---
  const maladieSoinsAmt = salaryBrut * RATES.maladieSoins;
  const maladieEspecesAmt = salaryBrut * RATES.maladieEspeces;
  const pensionAmt = salaryBrut * RATES.pension;
  const cotisations = maladieSoinsAmt + maladieEspecesAmt + pensionAmt;
  const dependanceAmt = salaryBrut * RATES.dependance;
  const totalSocial = cotisations + dependanceAmt;

  // --- Taxable income ---
  const totalImposable = salaryBrut - totalSocial;

  // --- Tax (simplified average rate per class) ---
  let impotsRate: number;
  let credit: number;

  switch (taxClass) {
    case "2":
      impotsRate = 0.065;
      credit = 116; // CIS x2 for married
      break;
    case "1a":
      impotsRate = 0.075;
      credit = 58;
      break;
    case "1":
    default:
      impotsRate = 0.0842;
      credit = 58;
      break;
  }

  const impots = Math.max(0, totalImposable * impotsRate);
  const net = totalImposable - impots + credit;

  return {
    salaryBrut: round(salaryBrut),
    heuresNormales: round(heuresNormales),
    heuresMaladie: round(heuresMaladie),
    heuresTotales: round(heuresNormales + heuresMaladie),
    maladieSoins: round(maladieSoinsAmt),
    maladieEspeces: round(maladieEspecesAmt),
    pension: round(pensionAmt),
    cotisations: round(cotisations),
    dependance: round(dependanceAmt),
    totalSocial: round(totalSocial),
    totalImposable: round(totalImposable),
    impots: round(impots),
    credit,
    net: round(net),
  };
}

function round(n: number): number {
  return Number(n.toFixed(2));
}
