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
  cisDefault: number;       // CIS mensuel par défaut (classe 1/1a) — 600/12 = 50
  cico2Default: number;     // CI-CO2 salarié mensuel par défaut
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
    cisDefault: 46,       // CIS 552/12
    cico2Default: 16,     // CI-CO2 192/12
    foMensuel: 45,
    dsMensuel: 40,
    monoparentalMensuel: 62.50,
    baremeCredit1: 29,
  },
  2025: {
    index: 968.04,
    ssmNonQualifie: 2703.74,  // Official: SSM NQ = 2 703,74 € (index 968.04)
    ssmQualifie: 3244.48,     // Official: SSM Q  = 3 244,48 €
    cisDefault: 50,            // CIS 600/12 (salary 11 266–40 000 €/year)
    cico2Default: 16,          // CI-CO2 192/12
    foMensuel: 45,
    dsMensuel: 40,
    monoparentalMensuel: 62.50,
    baremeCredit1: 29,
  },
  2026: {
    // Official (gouvernement.lu, Jan 2026): index unchanged at 968.04
    index: 968.04,
    ssmNonQualifie: 2703.74,  // Same as 2025 — no index tranche triggered
    ssmQualifie: 3244.48,     // Same as 2025
    cisDefault: 50,            // CIS 600/12 (unchanged for 2026)
    cico2Default: 18,          // CI-CO2 216/12 (increased from 192 to 216 for 2026)
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
  standardMonthlyHours: 176, // 22×8; official indemnité de congé uses 173h (Guichet.lu/ITM)
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
    if (slice > 0) tax += round(slice * b.rate); // round each slice to avoid float drift
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

  // ── 2. Progressive brackets (round each step for precision) ──
  let baseTax: number;
  if (taxClass === "2") {
    const half = taxableAfterForfaits / 2;
    baseTax = round(applyBrackets(half) * 2);
  } else {
    baseTax = round(applyBrackets(taxableAfterForfaits));
  }

  // ── 3. Solidarity surcharge (round after multiplication) ──
  const solidarityRate = monthlyTaxable > RATES.solidarityThreshold ? 0.09 : 0.07;
  const solidarity = round(baseTax * solidarityRate);
  const totalBrut = round(baseTax + solidarity);

  // ── 4. Barème credit (class-specific) ──
  let baremeCredit = 0;
  if (taxClass === "1a") {
    baremeCredit = round(Math.min(30, totalBrut * 0.35));
  } else if (taxClass === "2") {
    baremeCredit = round(params.baremeCredit1 * 2); // double for splitting
  } else {
    baremeCredit = params.baremeCredit1;
  }

  // ── 5. Impôt — rounded to nearest 10 cents (Luxembourg RTS rule) ──
  const impots = roundTo10cents(Math.max(0, totalBrut - baremeCredit));

  return {
    baseTax,
    solidarity,
    baremeCredit,
    impots,
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

/**
 * Round to the nearest 10 cents (0.10 EUR) — matches the Luxembourg RTS
 * rounding rule for the impôt retenu ("arrondi au multiple de 10 cents").
 */
function roundTo10cents(n: number): number {
  return Math.round(n * 10) / 10;
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

  // ── Auto crédits when input is 0 (from salary + year) ──
  const year = input.year || 2025;
  const annualBrut = salaryBrut * 12;
  const cisUsed = CIS > 0 ? CIS : computeCISFromAnnual(annualBrut, year);
  const cico2Used = CICO2 > 0 ? CICO2 : computeCICO2FromAnnual(annualBrut, year);
  const cissmUsed = CISSM > 0 ? CISSM : autoCISSM(salaryBrut, year);

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

  // ── External credits (CIS/CICO2/CISSM auto when 0) ──
  const totalCredits = round(cisUsed + CIP + CIM + cissmUsed + cico2Used);

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

    CIS: cisUsed,
    CIP,
    CIM,
    CISSM: cissmUsed,
    CICO2: cico2Used,
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

/** Default CIS based on tax class and year (fallback when no salary) */
export function defaultCIS(taxClass: string, year?: number): number {
  const p = getYearParams(year || 2025);
  return taxClass === "2" ? p.cisDefault * 2 : p.cisDefault;
}

/**
 * CIS mensuel from annual gross — ACD formula (2025/2026).
 * 936–11 265: 300 + (brut−936)×0.029; 11 266–40 000: 600; 40 001–79 999: 600−(brut−40 000)×0.015; ≥80 000: 0.
 */
export function computeCISFromAnnual(annualBrut: number, year: number): number {
  if (annualBrut < 936) return 0;
  if (annualBrut >= 80_000) return 0;
  let annual = 0;
  if (annualBrut <= 11_265) {
    annual = 300 + (annualBrut - 936) * 0.029;
  } else if (annualBrut <= 40_000) {
    annual = 600;
  } else {
    annual = Math.max(0, 600 - (annualBrut - 40_000) * 0.015);
  }
  return round(annual / 12);
}

/**
 * CI-CO2 mensuel from annual gross — ACD 2025: 192/12 (≤40k), 2026: 216/12 (≤40k); 40 001–79 999 formula; ≥80k: 0.
 */
export function computeCICO2FromAnnual(annualBrut: number, year: number): number {
  if (annualBrut < 936) return 0;
  if (annualBrut >= 80_000) return 0;
  const params = getYearParams(year);
  if (annualBrut <= 40_000) {
    return round((params.cico2Default * 12) / 12); // 16 or 18
  }
  // 40 001 – 79 999
  if (year >= 2026) {
    const annual = Math.max(0, 216 - (annualBrut - 40_000) * 0.0054);
    return round(annual / 12);
  }
  const annual = Math.max(0, 192 - (annualBrut - 40_000) * 0.0048);
  return round(annual / 12);
}

/**
 * CISSM mensuel — 2025+ bandes: 1 800–3 000 → 81 €; 3 000–3 600 → 81/600×(3 600−brut). Sinon 0.
 */
export function autoCISSM(grossMensuel: number, year?: number): number {
  const y = year || 2025;
  if (grossMensuel <= 0) return 0;
  if (y >= 2025) {
    if (grossMensuel >= 1800 && grossMensuel < 3000) return 81;
    if (grossMensuel >= 3000 && grossMensuel <= 3600) {
      return round((81 / 600) * (3600 - grossMensuel));
    }
    return 0;
  }
  const p = getYearParams(y);
  if (grossMensuel <= p.ssmQualifie) {
    const ratio = grossMensuel / p.ssmQualifie;
    return round(70 * ratio);
  }
  return 0;
}
