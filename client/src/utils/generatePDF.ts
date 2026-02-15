import { jsPDF } from "jspdf";
import type { PayrollResult } from "./calculations";
import { getWorkingDays, getCalendarDays } from "./calculations";

interface EmployeeData {
  name: string;
  role: string;
  ssn: string;
  numSecSociale: string;
  entryDate: string;
  dateAnciennete: string;
  taxClass: string;
  degreeOccupation: number;
  salaryMode: "monthly" | "hourly";
  hourlyRate: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimeRate: number;
  congesAnnuels: number;
  congesPris: number;
  feriados: number;
  recuperation: number;
  repos: number;
  maladieHeures: number;
}

interface CompanyData {
  name: string;
  address: string;
  city: string;
  tva: string;
}

/* ── Formatting helpers ── */

const MONTHS: Record<string, string> = {
  "01": "JANVIER", "02": "FEVRIER", "03": "MARS", "04": "AVRIL",
  "05": "MAI", "06": "JUIN", "07": "JUILLET", "08": "AOUT",
  "09": "SEPTEMBRE", "10": "OCTOBRE", "11": "NOVEMBRE", "12": "DECEMBRE",
};

function fmtP(period: string): string {
  const [y, m] = period.split("-");
  return `${MONTHS[m] || m} ${y}`;
}

/** Luxembourg number format: 3.000,00 */
function N(n: number): string {
  if (n === 0) return "0,00";
  const abs = Math.abs(n);
  const parts = abs.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const str = `${intPart},${parts[1]}`;
  return n < 0 ? `-${str}` : str;
}

function fmtDate(d: string): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yy = dt.getFullYear();
    return `${dd}/${mm}/${yy}`;
  } catch { return d; }
}

/* ══════════════════════════════════════════════════════════════
   GENERATE PAYSLIP PDF — Luxembourg "Décompte Salaire/Traitement"
   ══════════════════════════════════════════════════════════════ */

export const generatePayslipPDF = (
  employee: EmployeeData,
  company: CompanyData,
  results: PayrollResult,
  period: string = "2026-02",
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  /* ── Layout constants ── */
  const L = 12;          // left margin
  const R = 198;         // right edge
  const W = R - L;       // content width
  const M = L + W / 2;   // midpoint
  const gap = 3;          // gap between boxes

  /* ── Colors ── */
  const BK = "#1e293b";   // dark text
  const GR = "#64748b";   // gray text
  const LG = "#94a3b8";   // light gray
  const LC = "#e2e8f0";   // line color
  const BG = [248, 250, 252] as const; // very light bg
  const BG2 = [241, 245, 249] as const; // slightly darker bg
  const GREEN = "#059669";
  const RED = "#dc2626";

  const lw = 0.25;       // line width

  const [yearN, monthN] = period.split("-").map(Number);
  const JO = getWorkingDays(yearN, monthN);
  const JC = getCalendarDays(yearN, monthN);

  doc.setDrawColor(LC);
  doc.setLineWidth(lw);

  /* ══════════════════════════════════════════
     SECTION 1 — HEADER BOXES
     ══════════════════════════════════════════ */
  let y = 10;
  const boxH1 = 30;
  const leftW = M - L - gap / 2;
  const rightX = M + gap / 2;
  const rightW = R - rightX;

  // Left box — Title
  doc.rect(L, y, leftW, boxH1);
  const cx1 = L + leftW / 2;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.text("DECOMPTE SALAIRE / TRAITEMENT", cx1, y + 7, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(fmtP(period), cx1, y + 13, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(GR);
  doc.text(`Indice : ${results.index.toFixed(2)}`, cx1, y + 19.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.setFontSize(7.5);
  doc.text(`JO : ${JO}  \u2013  JC : ${JC}  \u2013  JI : ${JO}`, cx1, y + 25.5, { align: "center" });

  // Right box — Company
  doc.rect(rightX, y, rightW, boxH1);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.text(company.name || "Entreprise", rightX + 4, y + 7);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GR);
  let cy = y + 13;
  if (company.address) { doc.text(company.address, rightX + 4, cy); cy += 4.5; }
  if (company.city) { doc.text(company.city, rightX + 4, cy); cy += 4.5; }
  if (company.tva) { doc.text(company.tva, rightX + 4, cy); }

  /* ══════════════════════════════════════════
     SECTION 2 — EMPLOYEE DETAILS
     ══════════════════════════════════════════ */
  y += boxH1 + 2;
  const boxH2 = 34;

  // Left box — details
  doc.rect(L, y, leftW, boxH2);

  doc.setFontSize(7);
  const dxL = L + 3;
  const dxV = L + 38;
  let edy = y + 5;

  function detailRow(label: string, value: string, bold = false) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GR);
    doc.text(label, dxL, edy);
    doc.setTextColor(BK);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(`:  ${value}`, dxV, edy);
    edy += 4;
  }

  detailRow("Matricule", employee.ssn || "\u2014");
  detailRow("N\u00b0 Securite Sociale", employee.numSecSociale || "\u2014");
  detailRow("Date d'entree", fmtDate(employee.entryDate) || "\u2014");
  detailRow("Date d'anciennete", fmtDate(employee.dateAnciennete) || "\u2014");
  edy += 2;
  detailRow("Degre d'occupation", `${employee.degreeOccupation.toFixed(2)} / ${employee.degreeOccupation.toFixed(2)}`);
  detailRow("Mensuel", N(results.salaireBase), true);

  // Right box — employee name
  doc.rect(rightX, y, rightW, boxH2);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.text(employee.name || "\u2014", rightX + 4, y + 9);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GR);
  if (employee.role) doc.text(employee.role, rightX + 4, y + 15);
  doc.text(`Classe d'impot : ${employee.taxClass}`, rightX + 4, y + 21);

  /* ══════════════════════════════════════════
     SECTION 3 — MAIN TABLE
     ══════════════════════════════════════════ */
  y += boxH2 + 3;

  // Column edges (for vertical separators)
  const C1 = L + 12;      // end of Code
  const C2 = L + 100;     // end of Libellé
  const C3 = L + 125;     // end of Nb.Heures
  const C4 = L + 158;     // end of Taux
  // C5 = R (end of Montant)

  const rh = 5;           // row height

  // Table header
  doc.setFillColor(BG2[0], BG2[1], BG2[2]);
  doc.rect(L, y, W, rh + 1, "FD");

  // Column headers
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GR);
  doc.text("Code", L + 2, y + 3.8);
  doc.text("Libelle", C1 + 2, y + 3.8);
  doc.text("Nb. Heures", C3 - 1, y + 3.8, { align: "right" });
  doc.text("Taux", C4 - 1, y + 3.8, { align: "right" });
  doc.text("Montant", R - 2, y + 3.8, { align: "right" });

  // Column separator lines in header
  doc.line(C1, y, C1, y + rh + 1);
  doc.line(C2, y, C2, y + rh + 1);
  doc.line(C3, y, C3, y + rh + 1);
  doc.line(C4, y, C4, y + rh + 1);

  y += rh + 1;
  const tableTop = y;

  /* Row drawing helper */
  function drawRow(
    code: string, libelle: string, heures: string, taux: string, montant: string,
    opts?: {
      bold?: boolean;
      color?: string;
      bg?: readonly number[];
      indent?: boolean;
      separator?: boolean;
      thick?: boolean;
    },
  ) {
    const h = rh;

    // Background
    if (opts?.bg) {
      doc.setFillColor(opts.bg[0], opts.bg[1], opts.bg[2]);
      doc.rect(L, y, W, h, "F");
    }

    // Bottom line
    doc.setDrawColor(LC);
    doc.setLineWidth(opts?.thick ? 0.4 : lw);
    if (opts?.separator !== false) {
      doc.line(L, y + h, R, y + h);
    }

    // Column lines
    doc.setLineWidth(lw);
    doc.line(C1, y, C1, y + h);
    doc.line(C2, y, C2, y + h);
    doc.line(C3, y, C3, y + h);
    doc.line(C4, y, C4, y + h);

    // Text
    doc.setFontSize(7);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setTextColor(opts?.color || BK);

    const textY = y + 3.5;
    if (code) doc.text(code, L + 2, textY);
    if (libelle) doc.text(libelle, (opts?.indent ? C1 + 6 : C1 + 2), textY);
    if (heures) doc.text(heures, C3 - 2, textY, { align: "right" });
    if (taux) doc.text(taux, C4 - 2, textY, { align: "right" });
    if (montant) doc.text(montant, R - 2, textY, { align: "right" });

    y += h;
  }

  // ─── BRUT MENSUEL ───
  drawRow("", "BRUT MENSUEL", N(results.heuresTotales - results.heuresSupp), "", N(results.salaireBase), { bold: true });

  // ─── Overtime ───
  if (results.heuresSupp > 0) {
    const mult = employee.overtimeRate.toFixed(2);
    drawRow("", `Heures supplementaires (x${mult})`, N(results.heuresSupp), N(results.tauxHoraire), N(results.montantHeuresSupp));
  }

  // ─── Total brut ───
  drawRow("", "", "", "Total brut", N(results.salaryBrut), { bold: true, bg: BG, thick: true });

  // ─── Empty separator ───
  y += 1;

  // ─── Cotisations sociales ───
  drawRow("", "Caisse Maladie Soins 2,8000%", "", N(results.salaryBrut), N(results.maladieSoins), { indent: true });
  drawRow("", "Caisse Maladie Especes 0,2500%", "", N(results.salaryBrut), N(results.maladieEspeces), { indent: true });
  drawRow("", "Caisse Pension 8,0000%", "", N(results.salaryBrut), N(results.pension), { indent: true });
  drawRow("", "Caisse Dependance 1,4000%", "", N(results.dependanceBase), N(results.dependance), { indent: true });
  drawRow("", "Total des Cotisations Sociales", "", "", `-${N(results.totalSocial)}`, { bold: true, color: RED, thick: true });

  // ─── Déduction Fiche ───
  drawRow("", "Deduction Fiche", "", "Code FD", N(results.deductionFiche), { indent: false });

  // ─── Total Imposable ───
  y += 1;
  drawRow("", "Total Imposable", "", N(results.totalImposable), "", { indent: true });

  // ─── Impôt ───
  drawRow("", "Impot", "", "", `-${N(results.impots)}`, { indent: true, color: RED });

  // ─── Crédits d'impôts ───
  if (results.CIS > 0) drawRow("", "Credit d'impots (CIS)", "", "", N(results.CIS), { indent: true, color: GREEN });
  if (results.CIP > 0) drawRow("", "Credit d'impots (CIP)", "", "", N(results.CIP), { indent: true, color: GREEN });
  if (results.CIM > 0) drawRow("", "Credit d'impots (CIM)", "", "", N(results.CIM), { indent: true, color: GREEN });
  if (results.CISSM > 0) drawRow("", "Credit d'impots (CISSM)", "", "", N(results.CISSM), { indent: true, color: GREEN });
  if (results.CICO2 > 0) drawRow("", "Credit d'impots (CI-CO2)", "", "", N(results.CICO2), { indent: true, color: GREEN });

  // ─── Net ───
  drawRow("", "", "", "Net", N(results.net), { bold: true, bg: BG, thick: true });

  // ─── Frais / Avantages / Chèques repas ───
  if (results.fraisDeplacement > 0)
    drawRow("", "Frais de deplacement", "", "", N(results.fraisDeplacement), { indent: true });
  if (results.autresAvantages > 0)
    drawRow("", "Autres avantages", "", "", N(results.autresAvantages), { indent: true });
  if (results.chequesRepas > 0)
    drawRow("684", "- CHEQUES REPAS", "", "", `-${N(results.chequesRepas)}`, { bold: false });
  if (results.autresDeductions > 0)
    drawRow("", "- Autres deductions", "", "", `-${N(results.autresDeductions)}`, { bold: false });

  // ─── Outer table border ───
  doc.setDrawColor(LC);
  doc.setLineWidth(0.4);
  doc.rect(L, tableTop, W, y - tableTop);
  doc.setLineWidth(lw);

  /* ══════════════════════════════════════════
     NET A PAYER — banner
     ══════════════════════════════════════════ */
  y += 0.5;
  const napH = 8;
  doc.setFillColor(15, 23, 42);
  doc.rect(L, y, W, napH, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#ffffff");
  doc.text("NET A PAYER", L + 4, y + 5.5);

  doc.setFontSize(11);
  doc.text(N(results.netAPayer), R - 4, y + 5.5, { align: "right" });

  /* ══════════════════════════════════════════
     SECTION 4 — ANNUAL TOTALS
     ══════════════════════════════════════════ */
  y += napH + 4;

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.text(`TOTAL ANNUEL JUSQU'AU ${JC}/${String(monthN).padStart(2, "0")}/${yearN} INCLUS`, L, y);

  y += 2;
  const annH = 22;
  doc.setDrawColor(LC);
  doc.rect(L, y, W, annH);

  // 3-column layout like the real payslip
  const col1X = L + 3;
  const col2X = L + 65;
  const col3X = L + 130;

  doc.setFontSize(5.8);

  function annItem(x: number, yy: number, label: string, val: string) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GR);
    doc.text(label, x, yy);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BK);
    doc.text(val, x + 22, yy);
  }

  let ay = y + 4;
  const ls = 3.2;

  // Column 1
  annItem(col1X, ay, "Brut", N(results.salaryBrut));
  annItem(col1X, ay + ls, "Base CM", N(results.salaryBrut));
  annItem(col1X, ay + ls * 2, "COTIS CM", N(results.maladieSoins + results.maladieEspeces));
  annItem(col1X, ay + ls * 3, "Base CP", N(results.salaryBrut));
  annItem(col1X, ay + ls * 4, "COTIS CP", N(results.pension));
  annItem(col1X, ay + ls * 5, "Base CD", N(results.dependanceBase));
  annItem(col1X, ay + ls * 6, "COTIS CD", N(results.dependance));

  // Column 2
  annItem(col2X, ay, "DED. FD", N(results.deductionFiche));
  annItem(col2X, ay + ls, "DED. DS", N(0));
  annItem(col2X, ay + ls * 2, "DED. AC", N(0));
  annItem(col2X, ay + ls * 3, "DED. HS", N(0));
  annItem(col2X, ay + ls * 4, "DED. NDF", N(0));
  annItem(col2X, ay + ls * 5, "DED. AE", N(0));
  annItem(col2X, ay + ls * 6, "DED. FFO", N(0));

  // Column 3
  annItem(col3X, ay, "Impos.", N(results.totalImposable));
  annItem(col3X, ay + ls, "Impot", N(results.impots));
  annItem(col3X, ay + ls * 2, "CIS", N(results.CIS));
  annItem(col3X, ay + ls * 3, "CIM", N(results.CIM));
  annItem(col3X, ay + ls * 4, "CISSM", N(results.CISSM));
  annItem(col3X, ay + ls * 5, "Net", N(results.net));
  annItem(col3X, ay + ls * 6, "A PAYER", N(results.netAPayer));

  /* ══════════════════════════════════════════
     SECTION 5 — CONGÉS & ABSENCES (heures)
     ══════════════════════════════════════════ */
  y += annH + 4;

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.text("CONGES & ABSENCES (cumul annuel en heures)", L, y);

  y += 2;
  const leaveH = 16;
  doc.rect(L, y, W, leaveH);

  // Divider at midpoint
  doc.setDrawColor(LC);
  doc.line(M, y, M, y + leaveH);

  doc.setFontSize(6.5);
  const solde = employee.congesAnnuels - employee.congesPris;

  // Left half
  let lx = L + 3;
  let ly = y + 4.5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(GR);
  doc.text("Conges annuels :", lx, ly);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.text(`${employee.congesAnnuels} h`, lx + 30, ly);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(GR);
  doc.text("Pris :", lx + 45, ly);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BK);
  doc.text(`${employee.congesPris} h`, lx + 55, ly);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(GR);
  doc.text("Solde :", lx + 68, ly);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GREEN);
  doc.text(`${solde} h`, lx + 80, ly);

  ly += 4;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GR);
  doc.text("Feries :", lx, ly);
  doc.setTextColor(BK);
  doc.text(`${employee.feriados} h`, lx + 15, ly);

  doc.setTextColor(GR);
  doc.text("Recup. :", lx + 30, ly);
  doc.setTextColor(BK);
  doc.text(`${employee.recuperation} h`, lx + 46, ly);

  ly += 4;
  doc.setTextColor(GR);
  doc.text("Repos :", lx, ly);
  doc.setTextColor(BK);
  doc.text(`${employee.repos} h`, lx + 15, ly);

  doc.setTextColor(GR);
  doc.text("Maladie :", lx + 30, ly);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(employee.maladieHeures > 0 ? "#d97706" : BK);
  doc.text(`${employee.maladieHeures} h`, lx + 46, ly);

  // Right half — summary box
  const rx = M + 4;
  let ry = y + 4.5;

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GR);
  doc.text("Heures normales (mois) :", rx, ry);
  doc.setTextColor(BK);
  doc.text(`${N(results.heuresNormales)}`, rx + 42, ry);

  ry += 3.5;
  doc.setTextColor(GR);
  doc.text("Heures maladie (mois) :", rx, ry);
  doc.setTextColor(employee.maladieHeures > 0 ? "#d97706" : BK);
  doc.text(`${N(results.heuresMaladie)}`, rx + 42, ry);

  ry += 3.5;
  doc.setTextColor(GR);
  doc.text("Heures suppl. (mois) :", rx, ry);
  doc.setTextColor(BK);
  doc.text(`${N(results.heuresSupp)}`, rx + 42, ry);

  ry += 3.5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GR);
  doc.text("Total heures (mois) :", rx, ry);
  doc.setTextColor(BK);
  doc.text(`${N(results.heuresTotales)}`, rx + 42, ry);

  /* ══════════════════════════════════════════
     FOOTER
     ══════════════════════════════════════════ */
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LG);
  doc.text(
    "Document genere par LuxPayroll 2026  \u2014  Simulation indicative  \u2014  Grand-Duche de Luxembourg",
    105, 289, { align: "center" },
  );

  // Thin decorative line
  doc.setDrawColor(LC);
  doc.setLineWidth(0.15);
  doc.line(50, 286, 160, 286);

  /* ── Save ── */
  const safeName = (employee.name || "Employe").replace(/\s+/g, "_");
  doc.save(`Decompte_${safeName}_${period}.pdf`);
};
