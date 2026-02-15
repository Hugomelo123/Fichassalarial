/**
 * Luxembourg Payroll Engine — 2026
 * Progressive tax brackets (barème RTS) + solidarity surcharge
 * Based on CCSS / Administration des Contributions Directes rates.
 */

/* ══════════════════════════════════════════
   LUXEMBOURG 2026 PARAMETERS
   ══════════════════════════════════════════ */

export const LUX = {
  index: 955.99,
  ssmNonQualifie: 2570.93,
  ssmQualifie: 3085.11,

  // Social contributions (part salariale)
  maladieSoins: 0.028,
  maladieEspeces: 0.0025,
  pension: 0.08,
  dependance: 0.014,
  dependanceAbatement: 2570.93 / 4, // ~642.73

  standardWeeklyHours: 40,
  standardMonthlyHours: 176,

  cisDefault: 58,

  // Solidarity surcharge threshold (monthly)
  solidarityThreshold: 12500, // monthly taxable above this → 9%, below → 7%
};

/* ══════════════════════════════════════════
   TAX BRACKETS — Barème RTS mensuel 2026
   Each entry: { max, rate }
   Tax is progressive: each slice taxed at its rate.
   ══════════════════════════════════════════ */

type Bracket = { max: number; rate: number };

/** Classe 1 — Célibataire */
const BRACKETS_CL1: Bracket[] = [
  { max: 1036,     rate: 0 },
  { max: 1100,     rate: 0.08 },
  { max: 1283,     rate: 0.09 },
  { max: 1467,     rate: 0.10 },
  { max: 1650,     rate: 0.11 },
  { max: 1833,     rate: 0.12 },
  { max: 2017,     rate: 0.14 },
  { max: 2200,     rate: 0.16 },
  { max: 2383,     rate: 0.18 },
  { max: 2567,     rate: 0.20 },
  { max: 2750,     rate: 0.22 },
  { max: 2933,     rate: 0.24 },
  { max: 3117,     rate: 0.26 },
  { max: 3300,     rate: 0.28 },
  { max: 3483,     rate: 0.30 },
  { max: 3667,     rate: 0.32 },
  { max: 3850,     rate: 0.34 },
  { max: 4033,     rate: 0.36 },
  { max: 4217,     rate: 0.38 },
  { max: 4400,     rate: 0.39 },
  { max: 9200,     rate: 0.40 },
  { max: 13800,    rate: 0.41 },
  { max: Infinity, rate: 0.42 },
];

/** Classe 1a — Monoparental / veuf(ve) / 65+ */
const BRACKETS_CL1A: Bracket[] = [
  { max: 1370,     rate: 0 },
  { max: 1434,     rate: 0.08 },
  { max: 1617,     rate: 0.09 },
  { max: 1800,     rate: 0.10 },
  { max: 1983,     rate: 0.11 },
  { max: 2167,     rate: 0.12 },
  { max: 2350,     rate: 0.14 },
  { max: 2533,     rate: 0.16 },
  { max: 2717,     rate: 0.18 },
  { max: 2900,     rate: 0.20 },
  { max: 3083,     rate: 0.22 },
  { max: 3267,     rate: 0.24 },
  { max: 3450,     rate: 0.26 },
  { max: 3633,     rate: 0.28 },
  { max: 3817,     rate: 0.30 },
  { max: 4000,     rate: 0.32 },
  { max: 4183,     rate: 0.34 },
  { max: 4367,     rate: 0.36 },
  { max: 4550,     rate: 0.38 },
  { max: 4733,     rate: 0.39 },
  { max: 9534,     rate: 0.40 },
  { max: 14133,    rate: 0.41 },
  { max: Infinity, rate: 0.42 },
];

/* ══════════════════════════════════════════
   PROGRESSIVE TAX CALCULATION
   ══════════════════════════════════════════ */

function applyBrackets(monthlyTaxable: number, brackets: Bracket[]): number {
  let tax = 0;
  let prev = 0;

  for (const b of brackets) {
    if (monthlyTaxable <= prev) break;
    const slice = Math.min(monthlyTaxable, b.max) - prev;
    if (slice > 0) {
      tax += slice * b.rate;
    }
    prev = b.max;
  }

  return tax;
}

/**
 * Calculate tax using Luxembourg progressive barème.
 *
 * Class 2: Splitting method — divide income by 2, apply class 1 brackets, multiply by 2.
 * Class 1a: Separate brackets + barème credit min(30, total * 0.35).
 * Class 1: Standard brackets.
 */
function calculateTax(
  monthlyTaxable: number,
  taxClass: string,
): { baseTax: number; solidarity: number; baremeCredit: number; impots: number } {
  let baseTax: number;

  if (taxClass === "2") {
    // Splitting: divide by 2, apply class 1 brackets, multiply by 2
    const half = monthlyTaxable / 2;
    baseTax = applyBrackets(half, BRACKETS_CL1) * 2;
  } else if (taxClass === "1a") {
    baseTax = applyBrackets(monthlyTaxable, BRACKETS_CL1A);
  } else {
    baseTax = applyBrackets(monthlyTaxable, BRACKETS_CL1);
  }

  // Solidarity surcharge (contribution au fonds pour l'emploi)
  const solidarityRate = monthlyTaxable > LUX.solidarityThreshold ? 0.09 : 0.07;
  const solidarity = baseTax * solidarityRate;
  const totalBrut = baseTax + solidarity;

  // Barème-internal credit (class-specific)
  let baremeCredit = 0;
  if (taxClass === "1a") {
    baremeCredit = Math.min(30, totalBrut * 0.35);
  }
  // Class 2 moderation built into splitting already

  const impots = Math.max(0, totalBrut - baremeCredit);

  return { baseTax: round(baseTax), solidarity: round(solidarity), baremeCredit: round(baremeCredit), impots: round(impots) };
}

/* ══════════════════════════════════════════
   INTERFACES
   ══════════════════════════════════════════ */

export interface PayrollInput {
  salaryMode: "monthly" | "hourly";
  monthlyGross: number;
  hourlyRate: number;
  hoursWorked: number;
  maladieHours: number;

  overtimeHours: number;
  overtimeRate: number;

  taxClass: string;

  // Fiscal credits (monthly, shown separately on payslip)
  CIS: number;
  CIP: number;
  CIM: number;
  CISSM: number;
  CICO2: number;

  fraisDeplacement: number;
  chequesRepas: number;
  autresAvantages: number;
  autresDeductions: number;

  index: number;
}

export interface PayrollResult {
  salaireBase: number;
  heuresNormales: number;
  heuresMaladie: number;
  heuresSupp: number;
  heuresTotales: number;
  tauxHoraire: number;
  montantHeuresSupp: number;

  salaryBrut: number;

  maladieSoins: number;
  maladieEspeces: number;
  pension: number;
  cotisations: number;
  dependanceBase: number;
  dependance: number;
  totalSocial: number;

  deductionFiche: number;

  totalImposable: number;

  // Tax (progressive)
  baseTaxBrackets: number;  // raw bracket tax (before solidarity/credits)
  solidarity: number;       // contribution fonds emploi
  baremeCredit: number;     // class-specific barème credit (Cl.1a)
  impots: number;           // = baseTax + solidarity - barèmeCredit (before external credits)

  // External credits (user-set, shown on payslip as reductions of tax)
  CIS: number;
  CIP: number;
  CIM: number;
  CISSM: number;
  CICO2: number;
  totalCredits: number;

  // Actual tax withheld = max(0, impots - totalCredits)
  // Credits ONLY reduce the tax, never below 0. Excess is lost.
  impotRetenu: number;

  net: number;

  fraisDeplacement: number;
  chequesRepas: number;
  autresAvantages: number;
  autresDeductions: number;

  netAPayer: number;

  index: number;
}

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */

function round(n: number): number {
  return Number(n.toFixed(2));
}

export function getWorkingDays(year: number, month: number): number {
  const days = new Date(year, month, 0).getDate();
  let wd = 0;
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) wd++;
  }
  return wd;
}

export function getCalendarDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/* ══════════════════════════════════════════
   MAIN CALCULATION
   ══════════════════════════════════════════ */

export function calculateLuxSalary(input: PayrollInput): PayrollResult {
  const {
    salaryMode, monthlyGross, hourlyRate, hoursWorked, maladieHours,
    overtimeHours, overtimeRate,
    taxClass,
    CIS, CIP, CIM, CISSM, CICO2,
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
    salaireBase = hourlyRate * hoursWorked;
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

  const dependanceBase = round(Math.max(0, salaryBrut - LUX.dependanceAbatement));
  const dependanceAmt = round(dependanceBase * LUX.dependance);

  const totalSocial = round(cotisations + dependanceAmt);

  // ── Deduction fiche ──
  const deductionFiche = 0;

  // ── Taxable income ──
  // IMPORTANT: Dépendance does NOT reduce taxable income in Luxembourg.
  // Only maladie (soins + espèces) + pension reduce the base imposable.
  const totalImposable = round(salaryBrut - cotisations - deductionFiche);

  // ── Progressive tax ──
  const tax = calculateTax(totalImposable, taxClass);

  // ── External credits ──
  const totalCredits = round(CIS + CIP + CIM + CISSM + CICO2);

  // ── Impot retenu (credits reduce tax, never below 0) ──
  const impotRetenu = round(Math.max(0, tax.impots - totalCredits));

  // ── Net = totalImposable - dépendance - impotRetenu ──
  // Dépendance is subtracted from net but was NOT subtracted from totalImposable.
  const net = round(totalImposable - dependanceAmt - impotRetenu);

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

    baseTaxBrackets: tax.baseTax,
    solidarity: tax.solidarity,
    baremeCredit: tax.baremeCredit,
    impots: tax.impots,

    CIS,
    CIP,
    CIM,
    CISSM,
    CICO2,
    totalCredits,

    impotRetenu,

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
    const ratio = grossMensuel / LUX.ssmQualifie;
    return round(70 * ratio);
  }
  return 0;
}
