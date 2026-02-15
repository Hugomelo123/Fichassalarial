/**
 * Unit test: verifica que os créditos fiscais NÃO são aplicados duas vezes.
 *
 * Valores de teste (fornecidos pelo utilizador):
 *   brut            = 2896.54
 *   cotisations     = 351.61   (totalSocial)
 *   impotBrut       = 148.89   (baseTax + solidarity, antes de baremeCredit)
 *   credits         = 30 (bareme) + 58 (CIS) + 81 (CISSM) + 16 (CI-CO2) = 185
 *
 * Resultado esperado:
 *   totalImposable  = 2896.54 − 351.61 = 2544.93
 *   impotRetenu     = max(0, 148.89 − 30 − 58 − 81 − 16) = max(0, −36.11) = 0
 *   net             = 2544.93 − 0 = 2544.93
 *
 * BUG anterior (creditos somados 2×):
 *   impots          = 148.89 − 30 = 118.89
 *   net (ERRADO)    = 2544.93 − 118.89 + (58+81+16) = 2581.04  ← excede totalImposable!
 *
 * Run:  npx tsx client/src/utils/calculations.test.ts
 */

import { calculateLuxSalary, type PayrollInput, type PayrollResult } from "./calculations";

/* ─── Helper: build minimal input that produces the target brut & cotisations ─── */
function buildTestInput(overrides: Partial<PayrollInput> = {}): PayrollInput {
  return {
    salaryMode: "monthly",
    monthlyGross: 2896.54,
    hourlyRate: 0,
    hoursWorked: 176,
    maladieHours: 0,
    overtimeHours: 0,
    overtimeRate: 1.5,
    taxClass: "1a",
    CIS: 58,
    CIP: 0,
    CIM: 0,
    CISSM: 81,
    CICO2: 16,
    fraisDeplacement: 0,
    chequesRepas: 0,
    autresAvantages: 0,
    autresDeductions: 0,
    index: 955.99,
    ...overrides,
  };
}

/* ─── Assertions ─── */
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

/* ─── Run test ─── */
const input = buildTestInput();
const r: PayrollResult = calculateLuxSalary(input);

console.log("\n══════════════════════════════════════════");
console.log("  TEST: Duplicação de créditos fiscais");
console.log("══════════════════════════════════════════\n");
console.log(`  Brut:             ${r.salaryBrut}`);
console.log(`  Cotisations:      ${r.totalSocial}`);
console.log(`  Total Imposable:  ${r.totalImposable}`);
console.log(`  Base Tax:         ${r.baseTaxBrackets}`);
console.log(`  Solidarity:       ${r.solidarity}`);
console.log(`  Bareme credit:    ${r.baremeCredit}`);
console.log(`  Impots (avant):   ${r.impots}`);
console.log(`  Total credits:    ${r.totalCredits}`);
console.log(`  Impot retenu:     ${r.impotRetenu}`);
console.log(`  Net:              ${r.net}`);
console.log(`  Net a payer:      ${r.netAPayer}`);
console.log("");

// TEST 1: Net NUNCA pode exceder totalImposable (quando sem frais/avantages)
assert(
  r.net <= r.totalImposable,
  `Net (${r.net}) <= Total Imposable (${r.totalImposable})`
);

// TEST 2: impotRetenu = max(0, impots - totalCredits)
const expectedRetenu = Math.max(0, Number((r.impots - r.totalCredits).toFixed(2)));
assert(
  approx(r.impotRetenu, expectedRetenu),
  `impotRetenu (${r.impotRetenu}) ≈ max(0, ${r.impots} - ${r.totalCredits}) = ${expectedRetenu}`
);

// TEST 3: net = totalImposable - impotRetenu (sem creditos somados outra vez)
const expectedNet = Number((r.totalImposable - r.impotRetenu).toFixed(2));
assert(
  approx(r.net, expectedNet),
  `net (${r.net}) ≈ totalImposable (${r.totalImposable}) - impotRetenu (${r.impotRetenu}) = ${expectedNet}`
);

// TEST 4: Com credits > impots, impotRetenu deve ser 0 e net = totalImposable
const bigCreditsInput = buildTestInput({ CIS: 58, CISSM: 81, CICO2: 200 }); // credits way > tax
const r2 = calculateLuxSalary(bigCreditsInput);
assert(
  r2.impotRetenu === 0,
  `Quando credits (${r2.totalCredits}) > impots (${r2.impots}): impotRetenu = 0 (got ${r2.impotRetenu})`
);
assert(
  approx(r2.net, r2.totalImposable),
  `Quando credits excedem: net (${r2.net}) = totalImposable (${r2.totalImposable})`
);

// TEST 5: Com credits = 0, net = totalImposable - impots
const noCreditsInput = buildTestInput({ CIS: 0, CISSM: 0, CICO2: 0 });
const r3 = calculateLuxSalary(noCreditsInput);
assert(
  approx(r3.impotRetenu, r3.impots),
  `Sem credits: impotRetenu (${r3.impotRetenu}) = impots (${r3.impots})`
);
assert(
  approx(r3.net, r3.totalImposable - r3.impots),
  `Sem credits: net (${r3.net}) = totalImposable - impots = ${(r3.totalImposable - r3.impots).toFixed(2)}`
);

console.log("\n══════════════════════════════════════════");
console.log("  TODOS OS TESTES PASSARAM ✅");
console.log("══════════════════════════════════════════\n");
