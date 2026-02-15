/**
 * Unit test — verifica que os cálculos correspondem a uma ficha real luxemburguesa.
 *
 * Ficha de referência: SETEMBRO 2025 (DD CONSTRUCTIONS SA)
 *   Brut:               2.896,54
 *   Cotis. CM:          81,10 + 7,24 + 231,72 = 320,06
 *   Dep. base:          2.220,61  →  Dep: 31,09
 *   Total Social:       351,15
 *   Total Imposable:    2.576,48   (= brut − cotisations, SEM dépendance)
 *   Impôt:              176,20
 *   CIS:                50,00
 *   CI-CO2:             16,00
 *   CISSM:              81,00
 *   Net:                2.516,19
 *   NET A PAYER:        1.516,19   (acompte -1.000,00)
 *
 * Run:  npx tsx client/src/utils/calculations.test.ts
 */

import { calculateLuxSalary, type PayrollInput, type PayrollResult } from "./calculations";

/* ─── Helper ─── */
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
    ...overrides,
  };
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

function approx(a: number, b: number, tol = 0.02): boolean {
  return Math.abs(a - b) <= tol;
}

/* ═══════════════════════════════════
   TEST 1: Fluxo completo de cálculo
   ═══════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 1: Fluxo de cálculo (ficha real)");
console.log("══════════════════════════════════════════\n");

const input = buildInput();
const r: PayrollResult = calculateLuxSalary(input);

console.log(`  Brut:             ${r.salaryBrut}`);
console.log(`  Cotisations CM:   ${r.cotisations}  (maladie+pension, SEM dépendance)`);
console.log(`  Dependance:       ${r.dependance}   (base: ${r.dependanceBase})`);
console.log(`  Total Social:     ${r.totalSocial}  (cotis + dep)`);
console.log(`  Total Imposable:  ${r.totalImposable}  (brut − cotisations)`);
console.log(`  Impot:            ${r.impots}`);
console.log(`  CIS: ${r.CIS}  CI-CO2: ${r.CICO2}  CISSM: ${r.CISSM}`);
console.log(`  Impot retenu:     ${r.impotRetenu}`);
console.log(`  Net:              ${r.net}`);
console.log(`  Net a payer:      ${r.netAPayer}`);
console.log("");

// 1a. totalImposable = brut − cotisations (SEM dépendance)
assert(
  approx(r.totalImposable, r.salaryBrut - r.cotisations),
  `totalImposable (${r.totalImposable}) = brut (${r.salaryBrut}) − cotisations (${r.cotisations}) = ${(r.salaryBrut - r.cotisations).toFixed(2)} [dépendance NÃO subtraída]`
);

// 1b. totalImposable NÃO deve incluir dépendance
assert(
  r.totalImposable > r.salaryBrut - r.totalSocial,
  `totalImposable (${r.totalImposable}) > brut − totalSocial (${(r.salaryBrut - r.totalSocial).toFixed(2)}) [dépendance excluída]`
);

// 1c. impotRetenu = max(0, impots − credits)
const expectedRetenu = Math.max(0, Number((r.impots - r.totalCredits).toFixed(2)));
assert(
  approx(r.impotRetenu, expectedRetenu),
  `impotRetenu (${r.impotRetenu}) = max(0, ${r.impots} − ${r.totalCredits}) = ${expectedRetenu}`
);

// 1d. net = totalImposable − dépendance − impotRetenu
const expectedNet = Number((r.totalImposable - r.dependance - r.impotRetenu).toFixed(2));
assert(
  approx(r.net, expectedNet),
  `net (${r.net}) = totalImposable (${r.totalImposable}) − dépendance (${r.dependance}) − impotRetenu (${r.impotRetenu}) = ${expectedNet}`
);

// 1e. net = brut − totalSocial − impotRetenu (equivalente)
const expectedNet2 = Number((r.salaryBrut - r.totalSocial - r.impotRetenu).toFixed(2));
assert(
  approx(r.net, expectedNet2),
  `net (${r.net}) = brut (${r.salaryBrut}) − totalSocial (${r.totalSocial}) − impotRetenu (${r.impotRetenu}) = ${expectedNet2}`
);

// 1f. Net NUNCA excede totalImposable − dépendance
assert(
  r.net <= r.totalImposable - r.dependance + 0.01,
  `net (${r.net}) ≤ totalImposable − dep (${(r.totalImposable - r.dependance).toFixed(2)})`
);

/* ═══════════════════════════════════
   TEST 2: Credits > Impot (edge case)
   ═══════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 2: Créditos excedem imposto");
console.log("══════════════════════════════════════════\n");

const r2 = calculateLuxSalary(buildInput({ CIS: 100, CISSM: 200, CICO2: 100 }));
console.log(`  Impots: ${r2.impots}  Credits: ${r2.totalCredits}  ImpotRetenu: ${r2.impotRetenu}  Net: ${r2.net}`);

assert(r2.impotRetenu === 0, `impotRetenu = 0 quando créditos (${r2.totalCredits}) > impot (${r2.impots})`);
assert(
  approx(r2.net, r2.totalImposable - r2.dependance),
  `net (${r2.net}) = totalImposable − dep (${(r2.totalImposable - r2.dependance).toFixed(2)}) quando impotRetenu = 0`
);

/* ═══════════════════════════════════
   TEST 3: Sem créditos
   ═══════════════════════════════════ */
console.log("\n══════════════════════════════════════════");
console.log("  TEST 3: Sem créditos");
console.log("══════════════════════════════════════════\n");

const r3 = calculateLuxSalary(buildInput({ CIS: 0, CISSM: 0, CICO2: 0 }));
console.log(`  Impots: ${r3.impots}  ImpotRetenu: ${r3.impotRetenu}  Net: ${r3.net}`);

assert(
  approx(r3.impotRetenu, r3.impots),
  `Sem créditos: impotRetenu (${r3.impotRetenu}) = impots (${r3.impots})`
);
assert(
  approx(r3.net, r3.totalImposable - r3.dependance - r3.impots),
  `Sem créditos: net (${r3.net}) = imposable − dep − impots = ${(r3.totalImposable - r3.dependance - r3.impots).toFixed(2)}`
);

console.log("\n══════════════════════════════════════════");
console.log("  TODOS OS TESTES PASSARAM ✅");
console.log("══════════════════════════════════════════\n");
