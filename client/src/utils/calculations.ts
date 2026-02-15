/**
 * Luxembourg Payroll Engine
 * Progressive tax brackets (barème RTS) + solidarity surcharge
 * Year-based parameters (SSM, index, CIS, forfaits).
 * Based on CCSS / Administration des Contributions Directes.
 */

/* ══════════════════════════════════════════
   YEAR-BASED PARAMETERS
   ══════════════════════════════════════════ */

export interface YearParams {
  index: number;
  ssmNonQualifie: number;
  ssmQualifie: number;
  cisDefault: number;       // CIS mensuel par défaut (classe 1/1a)
  foMensuel: number;        // Frais d'obtention forfaitaire (mensuel)
  dsMensuel: number;        // Dépenses spéciales minimum (mensuel)
  monoparentalMensuel: number; // Abattement monoparental (classe 1a, mensuel)
  baremeCredit1: number;    // Crédit barème classe 1 (mensuel)
}

const YEAR_PARAMS: Record<number, YearParams> = {
  2024: {
    index: 944.43,
    ssmNonQualifie: 2570.93,
    ssmQualifie: 3085.11,
    cisDefault: 46,
    foMensuel: 45,
    dsMensuel: 40,
    monoparentalMensuel: 62.50,
    baremeCredit1: 29,
  },
  2025: {
    index: 968.04,
    ssmNonQualifie: 2703.72,
    ssmQualifie: 3244.47,
    cisDefault: 50,
    foMensuel: 45,
    dsMensuel: 40,
    monoparentalMensuel: 62.50,
    baremeCredit1: 29,
  },
  2026: {
    index: 987.78,
    ssmNonQualifie: 2771.31,
    ssmQualifie: 3325.58,
    cisDefault: 58,
    foMensuel: 45,
    dsMensuel: 40,
    monoparentalMensuel: 62.50,
    baremeCredit1: 29,
  },
};

export function getYearParams(year: number): YearParams {
  return YEAR_PARAMS[year] || YEAR_PARAMS[2025];
}

export function availableYears(): number[] {
  return Object.keys(YEAR_PARAMS).map(Number).sort();
}

/* ══════════════════════════════════════════
   FIXED RATES (same across years)
   ══════════════════════════════════════════ */

export const RATES = {
  maladieSoins: 0.028,
  maladieEspeces: 0.0025,
  pension: 0.08,
  dependance: 0.014,
  standardWeeklyHours: 40,
  standardMonthlyHours: 176,
  solidarityThreshold: 12500, // monthly taxable above this → 9%, below → 7%
};

/* ══════════════════════════════════════════
   TAX BRACKETS — Barème progressif mensuel
   Same brackets for ALL classes.
   Differences come from deductions & credits.
   ══════════════════════════════════════════ */

type Bracket = { max: number; rate: number };

const BRACKETS: Bracket[] = [
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

/* ══════════════════════════════════════════
   PROGRESSIVE TAX CALCULATION
   ══════════════════════════════════════════ */

function applyBrackets(monthlyTaxable: number): number {
  let tax = 0;
  let prev = 0;
  for (const b of BRACKETS) {
    if (monthlyTaxable <= prev) break;
    const slice = Math.min(monthlyTaxable, b.max) - prev;
    if (slice > 0) tax += slice * b.rate;
    prev = b.max;
  }
  return tax;
}

/**
 * Calculate tax using Luxembourg progressive barème.
 *
 * Flow:
 * 1. Subtract forfait deductions (FO + DS) from taxable base
 *    - Class 1a: also subtract monoparental abattement
 * 2. Apply progressive brackets
 *    - Class 2: Splitting (÷2, brackets, ×2)
 * 3. Add solidarity surcharge (7% or 9%)
 * 4. Subtract class-specific barème credit
 * 5. = Impôt (before external credits CIS/CIP/CIM/CISSM/CICO2)
 */
function calculateTax(
  monthlyTaxable: number,
  taxClass: string,
  params: YearParams,
): { baseTax: number; solidarity: number; baremeCredit: number; impots: number } {

  // ── 1. Forfait deductions (built into barème) ──
  let deductions = params.foMensuel + params.dsMensuel;
  if (taxClass === "1a") {
    deductions += params.monoparentalMensuel;
  }
  const taxableAfterForfaits = Math.max(0, monthlyTaxable - deductions);

  // ── 2. Progressive brackets ──
  let baseTax: number;
  if (taxClass === "2") {
    const half = taxableAfterForfaits / 2;
    baseTax = applyBrackets(half) * 2;
  } else {
    baseTax = applyBrackets(taxableAfterForfaits);
  }

  // ── 3. Solidarity surcharge ──
  const solidarityRate = monthlyTaxable > RATES.solidarityThreshold ? 0.09 : 0.07;
  const solidarity = baseTax * solidarityRate;
  const totalBrut = baseTax + solidarity;

  // ── 4. Barème credit (class-specific) ──
  let baremeCredit = 0;
  if (taxClass === "1a") {
    baremeCredit = Math.min(30, totalBrut * 0.35);
  } else if (taxClass === "2") {
    baremeCredit = params.baremeCredit1 * 2; // double for splitting
  } else {
    baremeCredit = params.baremeCredit1;
  }

  // ── 5. Impôt ──
  const impots = Math.max(0, totalBrut - baremeCredit);

  return {
    baseTax: round(baseTax),
    solidarity: round(solidarity),
    baremeCredit: round(baremeCredit),
    impots: round(impots),
  };
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
  year: number; // NEW: determines which YearParams to use
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

  baseTaxBrackets: number;
  solidarity: number;
  baremeCredit: number;
  impots: number;

  CIS: number;
  CIP: number;
  CIM: number;
  CISSM: number;
  CICO2: number;
  totalCredits: number;

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

  const params = getYearParams(input.year || 2025);

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
    tauxHoraire = monthlyGross > 0 ? monthlyGross / RATES.standardMonthlyHours : 0;
    heuresNormales = RATES.standardMonthlyHours - maladieHours;
  }

  // ── Overtime ──
  const montantHeuresSupp = round(overtimeHours * tauxHoraire * overtimeRate);

  // ── Gross ──
  const salaryBrut = round(salaireBase + montantHeuresSupp);

  // ── Social contributions ──
  const maladieSoinsAmt = round(salaryBrut * RATES.maladieSoins);
  const maladieEspecesAmt = round(salaryBrut * RATES.maladieEspeces);
  const pensionAmt = round(salaryBrut * RATES.pension);
  const cotisations = round(maladieSoinsAmt + maladieEspecesAmt + pensionAmt);

  // Dépendance: abatement = 1/4 SSM (year-based)
  const depAbatement = params.ssmNonQualifie / 4;
  const dependanceBase = round(Math.max(0, salaryBrut - depAbatement));
  const dependanceAmt = round(dependanceBase * RATES.dependance);

  const totalSocial = round(cotisations + dependanceAmt);

  // ── Deduction fiche ──
  const deductionFiche = 0;

  // ── Taxable income (dépendance does NOT reduce totalImposable) ──
  const totalImposable = round(salaryBrut - cotisations - deductionFiche);

  // ── Progressive tax (with FO+DS deductions and barème credit) ──
  const tax = calculateTax(totalImposable, taxClass, params);

  // ── External credits ──
  const totalCredits = round(CIS + CIP + CIM + CISSM + CICO2);

  // ── Impot retenu (credits reduce tax, never below 0) ──
  const impotRetenu = round(Math.max(0, tax.impots - totalCredits));

  // ── Net = totalImposable - dépendance - impotRetenu ──
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

/** Default CIS based on tax class and year */
export function defaultCIS(taxClass: string, year?: number): number {
  const p = getYearParams(year || 2025);
  return taxClass === "2" ? p.cisDefault * 2 : p.cisDefault;
}

/** Auto-calculate CISSM if gross is near SSM */
export function autoCISSM(grossMensuel: number, year?: number): number {
  const p = getYearParams(year || 2025);
  if (grossMensuel <= 0) return 0;
  if (grossMensuel <= p.ssmQualifie) {
    const ratio = grossMensuel / p.ssmQualifie;
    return round(70 * ratio);
  }
  return 0;
}
