/**
 * Luxembourg Payroll Engine — 2026
 * Based on CCSS / Administration des Contributions Directes rates.
 */

/* ── Luxembourg 2026 Parameters ── */

export const LUX = {
  /** Indice actuel (cost-of-living index) */
  index: 955.99,

  /** Salaire Social Minimum (SSM) mensuel — non qualifié */
  ssmNonQualifie: 2570.93,
  /** SSM mensuel — qualifié (+20%) */
  ssmQualifie: 3085.11,

  /** Social contribution rates (part salariale) */
  maladieSoins: 0.028,       // 2.80% — CNS soins de santé
  maladieEspeces: 0.0025,    // 0.25% — CNS indemnités pécuniaires
  pension: 0.08,              // 8.00% — CNAP
  dependance: 0.014,          // 1.40% — Assurance dépendance

  /** Abattement dépendance = 1/4 SSM non-qualifié */
  dependanceAbatement: 2570.93 / 4, // ~642.73

  /** Standard hours */
  standardWeeklyHours: 40,
  standardMonthlyHours: 176,

  /** CIS default (Crédit d'Impôt pour Salariés) */
  cisDefault: 58,
};

/* ── Interfaces ── */

export interface PayrollInput {
  salaryMode: "monthly" | "hourly";
  monthlyGross: number;
  hourlyRate: number;
  hoursWorked: number;
  maladieHours: number;

  // Overtime
  overtimeHours: number;
  overtimeRate: number; // multiplier e.g. 1.4 = majoration 40%

  // Tax
  taxClass: string;

  // Fiscal credits (monthly)
  CIS: number;  // Crédit d'Impôt Salarié
  CIP: number;  // Crédit d'Impôt Pensionné
  CIM: number;  // Crédit d'Impôt Monoparental
  CISSM: number; // Crédit d'Impôt SSM

  // Avantages / Déductions
  fraisDeplacement: number;
  chequesRepas: number;
  autresAvantages: number;
  autresDeductions: number;

  // Index
  index: number;
}

export interface PayrollResult {
  // Base
  salaireBase: number;
  heuresNormales: number;
  heuresMaladie: number;
  heuresSupp: number;
  heuresTotales: number;
  tauxHoraire: number;
  montantHeuresSupp: number;

  // Gross
  salaryBrut: number;

  // Social contributions
  maladieSoins: number;
  maladieEspeces: number;
  pension: number;
  cotisations: number;
  dependanceBase: number;
  dependance: number;
  totalSocial: number;

  // Deduction fiche (always 0 in standard case)
  deductionFiche: number;

  // Tax
  totalImposable: number;
  impots: number;

  // Credits
  CIS: number;
  CIP: number;
  CIM: number;
  CISSM: number;
  totalCredits: number;

  // Net before adjustments
  net: number;

  // Adjustments (non-taxable)
  fraisDeplacement: number;
  chequesRepas: number;
  autresAvantages: number;
  autresDeductions: number;

  // Final
  netAPayer: number;

  // Index
  index: number;
}

/* ── Helpers ── */

function round(n: number): number {
  return Number(n.toFixed(2));
}

/** Get working days (Mon-Fri) in a month */
export function getWorkingDays(year: number, month: number): number {
  const days = new Date(year, month, 0).getDate();
  let wd = 0;
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) wd++;
  }
  return wd;
}

/** Get calendar days in a month */
export function getCalendarDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/* ── Main Calculation ── */

export function calculateLuxSalary(input: PayrollInput): PayrollResult {
  const {
    salaryMode, monthlyGross, hourlyRate, hoursWorked, maladieHours,
    overtimeHours, overtimeRate,
    taxClass,
    CIS, CIP, CIM, CISSM,
    fraisDeplacement, chequesRepas, autresAvantages, autresDeductions,
    index,
  } = input;

  // ── Base salary ──
  let salaireBase: number;
  let heuresNormales: number;
  let tauxHoraire: number;

  if (salaryMode === "hourly") {
    heuresNormales = Math.max(0, hoursWorked - maladieHours);
    tauxHoraire = hourlyRate;
    salaireBase = hourlyRate * hoursWorked; // includes maladie hours (employer continues to pay)
  } else {
    salaireBase = monthlyGross;
    tauxHoraire = monthlyGross > 0 ? monthlyGross / LUX.standardMonthlyHours : 0;
    heuresNormales = LUX.standardMonthlyHours - maladieHours;
  }

  // ── Overtime ──
  const montantHeuresSupp = round(overtimeHours * tauxHoraire * overtimeRate);

  // ── Gross ──
  const salaryBrut = round(salaireBase + montantHeuresSupp);

  // ── Social contributions ──
  const maladieSoinsAmt = round(salaryBrut * LUX.maladieSoins);
  const maladieEspecesAmt = round(salaryBrut * LUX.maladieEspeces);
  const pensionAmt = round(salaryBrut * LUX.pension);
  const cotisations = round(maladieSoinsAmt + maladieEspecesAmt + pensionAmt);

  // Dépendance: base = max(0, brut - 1/4 SSM)
  const depAbatement = LUX.dependanceAbatement;
  const dependanceBase = round(Math.max(0, salaryBrut - depAbatement));
  const dependanceAmt = round(dependanceBase * LUX.dependance);

  const totalSocial = round(cotisations + dependanceAmt);

  // ── Deduction fiche ──
  const deductionFiche = 0; // Code FD — for specific cases

  // ── Taxable income ──
  const totalImposable = round(salaryBrut - totalSocial - deductionFiche);

  // ── Tax (simplified average rate per class) ──
  let impotsRate: number;
  switch (taxClass) {
    case "2":
      impotsRate = 0.065;
      break;
    case "1a":
      impotsRate = 0.075;
      break;
    case "1":
    default:
      impotsRate = 0.0842;
      break;
  }
  const impots = round(Math.max(0, totalImposable * impotsRate));

  // ── Credits ──
  const totalCredits = round(CIS + CIP + CIM + CISSM);

  // ── Net ──
  const net = round(totalImposable - impots + totalCredits);

  // ── NET A PAYER ──
  const netAPayer = round(net + fraisDeplacement + autresAvantages - chequesRepas - autresDeductions);

  return {
    salaireBase: round(salaireBase),
    heuresNormales: round(heuresNormales),
    heuresMaladie: round(maladieHours),
    heuresSupp: round(overtimeHours),
    heuresTotales: round(heuresNormales + maladieHours + overtimeHours),
    tauxHoraire: round(tauxHoraire),
    montantHeuresSupp,

    salaryBrut,

    maladieSoins: maladieSoinsAmt,
    maladieEspeces: maladieEspecesAmt,
    pension: pensionAmt,
    cotisations,
    dependanceBase,
    dependance: dependanceAmt,
    totalSocial,

    deductionFiche,

    totalImposable,
    impots,

    CIS,
    CIP,
    CIM,
    CISSM,
    totalCredits,

    net,

    fraisDeplacement,
    chequesRepas,
    autresAvantages,
    autresDeductions,

    netAPayer,

    index,
  };
}

/** Default CIS based on tax class */
export function defaultCIS(taxClass: string): number {
  return taxClass === "2" ? 116 : 58;
}

/** Auto-calculate CISSM if gross is near SSM */
export function autoCISSM(grossMensuel: number): number {
  if (grossMensuel <= 0) return 0;
  if (grossMensuel <= LUX.ssmQualifie) {
    // Simplified: proportional credit for SSM earners (max ~70 EUR/month)
    const ratio = grossMensuel / LUX.ssmQualifie;
    return round(70 * ratio);
  }
  return 0;
}
