/**
 * Unit test — verifica cálculos contra ficha real luxemburguesa.
 *
 * Ficha de referência: SETEMBRO 2025 (DD CONSTRUCTIONS SA, Classe 1)
 *   Brut:               2.896,54
 *   Maladie Soins:      81,10   (2896.54 × 2.8%)
 *   Maladie Espèces:    7,24    (2896.54 × 0.25%)
 *   Pension:            231,72  (2896.54 × 8%)
 *   Cotisations:        320,06
 *   Dep. base:          2.220,61   Dep: 31,09
 *   Total Social:       351,15
 *   Total Imposable:    2.576,48   (brut − cotisations, SEM dépendance)
 *   Impôt:              176,20
 *   CIS:                50,00
 *   CI-CO2:             16,00
 *   CISSM:              81,00
 *   Net:                2.516,19
 *
 * Run:  npx tsx client/src/utils/calculations.test.ts
 */

import { calculateLuxSalary, type PayrollInput, type PayrollResult } from "./calculations";

function buildInput(overrides: Partial<PayrollInput> = {}): PayrollInput {
  return {
    salaryMode: "monthly",
    monthlyGross: 2896.54,
    hourlyRate: 0,
    hoursWorked: 176,
    maladieHours: 0,
    overtimeHours: 0,
    overtimeRate: 1.5,
    taxClass: "1",
    CIS: 50,
    CIP: 0,
    CIM: 0,
    CISSM: 81,
    CICO2: 16,
    fraisDeplacement: 0,
    chequesRepas: 0,
    autresAvantages: 0,
    autresDeductions: 0,
    index: 968.04,
    year: 2025,
    ...overrides,
  };
}

function assert(cond: boolean, msg: string) {
  if (!cond) { console.error(`❌ FAIL: ${msg}`); process.exit(1); }
  console.log(`✅ PASS: ${msg}`);
}

function approx(a: number, b: number, tol = 0.50): boolean {
  return Math.abs(a - b) <= tol;
}

/* ═══════════════════════════════════════════════════════
   TEST 1: Ficha Setembro 2025 — Classe 1
   ═══════════════════════════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 1: Ficha Setembro 2025 (Classe 1)");
console.log("══════════════════════════════════════════\n");

const r = calculateLuxSalary(buildInput());

console.log(`  Brut:             ${r.salaryBrut}`);
console.log(`  Cotisations CM:   ${r.cotisations}`);
console.log(`  Dep. base:        ${r.dependanceBase}   Dep: ${r.dependance}`);
console.log(`  Total Social:     ${r.totalSocial}`);
console.log(`  Total Imposable:  ${r.totalImposable}`);
console.log(`  Impot:            ${r.impots}`);
console.log(`  Credits:          CIS=${r.CIS} CI-CO2=${r.CICO2} CISSM=${r.CISSM} Total=${r.totalCredits}`);
console.log(`  Impot retenu:     ${r.impotRetenu}`);
console.log(`  Net:              ${r.net}`);
console.log(`  Net a payer:      ${r.netAPayer}`);
console.log("");

// Cotisations CM (maladie + pension, SEM dépendance)
assert(approx(r.cotisations, 320.06, 0.01), `Cotisations CM: ${r.cotisations} ≈ 320.06`);

// Dépendance base (brut − 1/4 SSM 2025)
assert(approx(r.dependanceBase, 2220.61, 0.5), `Dep. base: ${r.dependanceBase} ≈ 2220.61`);

// Dépendance
assert(approx(r.dependance, 31.09, 0.5), `Dependance: ${r.dependance} ≈ 31.09`);

// Total Social
assert(approx(r.totalSocial, 351.15, 0.5), `Total Social: ${r.totalSocial} ≈ 351.15`);

// Total Imposable = brut − cotisations (SEM dépendance)
assert(approx(r.totalImposable, 2576.48, 0.01), `Total Imposable: ${r.totalImposable} ≈ 2576.48`);

// Impôt (should be close to 176.20 with FO+DS deductions + barème credit)
assert(approx(r.impots, 176.20, 2.0), `Impot: ${r.impots} ≈ 176.20 (±2.00)`);

// Net formula: totalImposable − dépendance − impotRetenu
const expectedNet = Number((r.totalImposable - r.dependance - r.impotRetenu).toFixed(2));
assert(approx(r.net, expectedNet, 0.01), `Net: ${r.net} = totalImposable − dep − impotRetenu = ${expectedNet}`);

// Net should match real payslip approximately
assert(approx(r.net, 2516.19, 3.0), `Net: ${r.net} ≈ 2516.19 (±3.00)`);

/* ═══════════════════════════════════════════════════════
   TEST 2: Créditos excedem imposto
   ═══════════════════════════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 2: Créditos excedem imposto");
console.log("══════════════════════════════════════════\n");

const r2 = calculateLuxSalary(buildInput({ CIS: 200, CISSM: 200, CICO2: 200, year: 2025 }));
console.log(`  Impots: ${r2.impots}  Credits: ${r2.totalCredits}  ImpotRetenu: ${r2.impotRetenu}  Net: ${r2.net}`);

assert(r2.impotRetenu === 0, `impotRetenu = 0 quando créditos > impot`);
assert(
  approx(r2.net, r2.totalImposable - r2.dependance, 0.01),
  `net = totalImposable − dep quando impotRetenu = 0`
);

/* ═══════════════════════════════════════════════════════
   TEST 3: Classe 1a (com credit bareme 1a + monoparental)
   ═══════════════════════════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 3: Classe 1a");
console.log("══════════════════════════════════════════\n");

const r3 = calculateLuxSalary(buildInput({ taxClass: "1a", CIS: 50, year: 2025 }));
console.log(`  TotalImposable: ${r3.totalImposable}  Impots: ${r3.impots}  BaremeCredit: ${r3.baremeCredit}`);
// Classe 1a should have lower tax due to monoparental abatement + barème credit
assert(r3.impots < r.impots, `Classe 1a impots (${r3.impots}) < Classe 1 impots (${r.impots})`);

/* ═══════════════════════════════════════════════════════
   TEST 4: Classe 2 (splitting)
   ═══════════════════════════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 4: Classe 2 (splitting)");
console.log("══════════════════════════════════════════\n");

const r4 = calculateLuxSalary(buildInput({ taxClass: "2", CIS: 100, year: 2025 }));
console.log(`  TotalImposable: ${r4.totalImposable}  Impots: ${r4.impots}  BaremeCredit: ${r4.baremeCredit}`);
// Splitting should give lowest tax
assert(r4.impots < r.impots, `Classe 2 impots (${r4.impots}) < Classe 1 impots (${r.impots})`);

/* ═══════════════════════════════════════════════════════
   TEST 5: Year 2026 uses different params
   ═══════════════════════════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 5: Parametros 2026 diferem de 2025");
console.log("══════════════════════════════════════════\n");

const r5 = calculateLuxSalary(buildInput({ year: 2026 }));
console.log(`  2025: dep.base=${r.dependanceBase} dep=${r.dependance}`);
console.log(`  2026: dep.base=${r5.dependanceBase} dep=${r5.dependance}`);
// 2026 has higher SSM → higher abatement → lower dependance base
assert(
  r5.dependanceBase !== r.dependanceBase,
  `Dep. base 2026 (${r5.dependanceBase}) ≠ Dep. base 2025 (${r.dependanceBase})`
);

console.log("\n══════════════════════════════════════════");
console.log("  TODOS OS TESTES PASSARAM ✅");
console.log("══════════════════════════════════════════\n");
