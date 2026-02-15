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
  // Leave
  congesAnnuels: number;
  congesPris: number;
  feriados: number;
  recuperation: number;
  repos: number;
  maladieDays: number;
}

interface CompanyData {
  name: string;
  address: string;
  city: string;
  tva: string;
}

const MONTHS: Record<string, string> = {
  "01": "JANVIER", "02": "FEVRIER", "03": "MARS", "04": "AVRIL",
  "05": "MAI", "06": "JUIN", "07": "JUILLET", "08": "AOUT",
  "09": "SEPTEMBRE", "10": "OCTOBRE", "11": "NOVEMBRE", "12": "DECEMBRE",
};

function fmtP(period: string): string {
  const [y, m] = period.split("-");
  return `${MONTHS[m] || m} ${y}`;
}

function fmtN(n: number): string {
  // Luxembourg format: 3.000,00
  const parts = n.toFixed(2).split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${intPart},${parts[1]}`;
}

function fmtDate(d: string): string {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("fr-LU", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return d; }
}

export const generatePayslipPDF = (
  employee: EmployeeData,
  company: CompanyData,
  results: PayrollResult,
  period: string = "2026-02",
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Colors
  const black = "#0f172a";
  const gray = "#64748b";
  const lightGray = "#94a3b8";
  const lineColor = "#cbd5e1";

  const pageW = 210;
  const marginL = 10;
  const marginR = 200;
  const contentW = marginR - marginL;
  const midX = marginL + contentW / 2;

  const [yearN, monthN] = period.split("-").map(Number);
  const JO = getWorkingDays(yearN, monthN);
  const JC = getCalendarDays(yearN, monthN);

  // ──────────────── HEADER ────────────────
  let y = 10;

  // Title box (left)
  doc.setDrawColor(lineColor);
  doc.setLineWidth(0.3);
  doc.rect(marginL, y, contentW / 2 - 2, 32);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text("DECOMPTE SALAIRE/TRAITEMENT", marginL + (contentW / 4 - 1), y + 7, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(fmtP(period), marginL + (contentW / 4 - 1), y + 14, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(gray);
  doc.text(`Indice : ${results.index.toFixed(2)}`, marginL + (contentW / 4 - 1), y + 21, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text(`JO : ${JO}  -  JC : ${JC}  -  JI : ${JO}`, marginL + (contentW / 4 - 1), y + 28, { align: "center" });

  // Company box (right)
  const rightBoxX = midX + 2;
  doc.setFont("helvetica", "normal");
  doc.rect(rightBoxX, y, contentW / 2 - 2, 32);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text(company.name || "Entreprise", rightBoxX + 5, y + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray);
  let compY = y + 14;
  if (company.address) { doc.text(company.address, rightBoxX + 5, compY); compY += 5; }
  if (company.city) { doc.text(company.city, rightBoxX + 5, compY); compY += 5; }
  if (company.tva) { doc.text(company.tva, rightBoxX + 5, compY); }

  // ──────────────── EMPLOYEE DETAILS ────────────────
  y = 46;

  // Left: employee details
  doc.rect(marginL, y, contentW / 2 - 2, 38);
  doc.setFontSize(7.5);
  doc.setTextColor(black);

  const detailX = marginL + 4;
  const detailValX = marginL + 40;
  let dy = y + 6;

  const details = [
    ["Matricule", employee.ssn || "—"],
    ["N° Securite Sociale", employee.numSecSociale || "—"],
    ["Date d'entree", fmtDate(employee.entryDate)],
    ["Date d'anciennete", fmtDate(employee.dateAnciennete)],
    ["", ""],
    ["Degre d'occupation", `${employee.degreeOccupation.toFixed(2)} / ${employee.degreeOccupation.toFixed(2)}`],
    ["Mensuel", fmtN(results.salaireBase)],
  ];

  for (const [label, value] of details) {
    if (label === "" && value === "") { dy += 2; continue; }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray);
    doc.text(label, detailX, dy);
    doc.setFont("helvetica", label === "Mensuel" ? "bold" : "normal");
    doc.setTextColor(black);
    doc.text(`: ${value}`, detailValX, dy);
    dy += 4.5;
  }

  // Right: employee name
  doc.rect(rightBoxX, y, contentW / 2 - 2, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text(employee.name || "—", rightBoxX + 5, y + 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray);
  doc.text(employee.role || "—", rightBoxX + 5, y + 17);
  doc.text(`Classe : ${employee.taxClass}`, rightBoxX + 5, y + 23);

  // ──────────────── MAIN TABLE ────────────────
  y = 88;

  // Column positions
  const col = {
    code: marginL,
    libelle: marginL + 14,
    heures: marginL + 110,
    taux: marginL + 140,
    montant: marginR - 2,
  };

  // Table header
  doc.setFillColor(245, 247, 250); // slate-50
  doc.rect(marginL, y, contentW, 6, "F");
  doc.rect(marginL, y, contentW, 6);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(gray);
  doc.text("Code", col.code + 2, y + 4);
  doc.text("Libelle", col.libelle, y + 4);
  doc.text("Nb. Heures", col.heures, y + 4, { align: "right" });
  doc.text("Taux", col.taux, y + 4, { align: "right" });
  doc.text("Montant", col.montant, y + 4, { align: "right" });

  y += 6;

  // Helper to draw a row
  function row(code: string, libelle: string, heures: string, taux: string, montant: string, opts?: { bold?: boolean; color?: string; bgColor?: number[] }) {
    if (opts?.bgColor) {
      doc.setFillColor(opts.bgColor[0], opts.bgColor[1], opts.bgColor[2]);
      doc.rect(marginL, y, contentW, 5.5, "F");
    }
    doc.setDrawColor(lineColor);
    doc.line(marginL, y + 5.5, marginR, y + 5.5);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setTextColor(opts?.color || black);

    if (code) doc.text(code, col.code + 2, y + 4);
    if (libelle) doc.text(libelle, col.libelle, y + 4);
    if (heures) doc.text(heures, col.heures, y + 4, { align: "right" });
    if (taux) doc.text(taux, col.taux, y + 4, { align: "right" });
    if (montant) doc.text(montant, col.montant, y + 4, { align: "right" });

    y += 5.5;
  }

  // Draw outer border
  const tableStartY = y;

  // BRUT MENSUEL
  row("", "BRUT MENSUEL", fmtN(results.heuresTotales), "", fmtN(results.salaireBase), { bold: true });

  // Overtime
  if (results.heuresSupp > 0) {
    row("", `Heures supplementaires (x${(results.montantHeuresSupp / (results.heuresSupp * results.tauxHoraire)).toFixed(2)})`, fmtN(results.heuresSupp), fmtN(results.tauxHoraire), fmtN(results.montantHeuresSupp));
  }

  // Total brut
  row("", "", "", "Total brut", fmtN(results.salaryBrut), { bold: true, bgColor: [245, 247, 250] });

  // Spacer
  y += 2;

  // Cotisations
  row("", `Caisse Maladie Soins 2,8000%`, "", fmtN(results.salaryBrut), fmtN(results.maladieSoins));
  row("", `Caisse Maladie Especes 0,2500%`, "", fmtN(results.salaryBrut), fmtN(results.maladieEspeces));
  row("", `Caisse Pension 8,0000%`, "", fmtN(results.salaryBrut), fmtN(results.pension));
  row("", `Caisse Dependance 1,4000%`, "", fmtN(results.dependanceBase), fmtN(results.dependance));
  row("", "Total des Cotisations Sociales", "", "", `-${fmtN(results.totalSocial)}`, { bold: true, color: "#dc2626" });

  // Déduction fiche
  row("", "Deduction Fiche", "", `Code FD`, fmtN(results.deductionFiche));

  // Total imposable
  y += 1;
  row("", "   Total Imposable", "", fmtN(results.totalImposable), "");

  // Impot
  row("", "   Impot", "", "", `-${fmtN(results.impots)}`, { color: "#dc2626" });

  // Credits
  if (results.CIS > 0) row("", "   Credit d'impots (CIS)", "", "", fmtN(results.CIS), { color: "#059669" });
  if (results.CIP > 0) row("", "   Credit d'impots (CIP)", "", "", fmtN(results.CIP), { color: "#059669" });
  if (results.CIM > 0) row("", "   Credit d'impots (CIM)", "", "", fmtN(results.CIM), { color: "#059669" });
  if (results.CISSM > 0) row("", "   Credit d'impots (CISSM)", "", "", fmtN(results.CISSM), { color: "#059669" });

  // Net
  row("", "", "", "Net", fmtN(results.net), { bold: true, bgColor: [245, 247, 250] });

  // Frais / Cheques
  if (results.fraisDeplacement > 0) row("", "Frais de deplacement", "", "", fmtN(results.fraisDeplacement), { color: "#059669" });
  if (results.autresAvantages > 0) row("", "Autres avantages", "", "", fmtN(results.autresAvantages), { color: "#059669" });
  if (results.chequesRepas > 0) row("684", "- CHEQUES REPAS", "", "", `-${fmtN(results.chequesRepas)}`, { color: "#dc2626" });
  if (results.autresDeductions > 0) row("", "- Autres deductions", "", "", `-${fmtN(results.autresDeductions)}`, { color: "#dc2626" });

  // Table border
  doc.setDrawColor(lineColor);
  doc.setLineWidth(0.3);
  doc.rect(marginL, tableStartY, contentW, y - tableStartY);

  // ──── NET A PAYER ────
  y += 1;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(marginL, y, contentW, 9, 1, 1, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#ffffff");
  doc.text("NET A PAYER", marginL + 5, y + 6.5);
  doc.text(`${fmtN(results.netAPayer)}`, marginR - 5, y + 6.5, { align: "right" });

  // ──────────────── ANNUAL TOTAL ────────────────
  y += 14;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text(`TOTAL ANNUEL JUSQU'AU ${getCalendarDays(yearN, monthN)}/${String(monthN).padStart(2, "0")}/${yearN} INCLUS`, marginL, y);

  y += 3;
  doc.setDrawColor(lineColor);
  doc.rect(marginL, y, contentW, 18);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray);

  const annualItems = [
    [`Brut`, fmtN(results.salaryBrut), `Impos.`, fmtN(results.totalImposable)],
    [`Cotis.`, fmtN(results.totalSocial), `Impot`, fmtN(results.impots)],
    [`CIS`, fmtN(results.CIS), `Net`, fmtN(results.net)],
    [`CISSM`, fmtN(results.CISSM), `A PAYER`, fmtN(results.netAPayer)],
  ];

  let ay = y + 4.5;
  for (const [l1, v1, l2, v2] of annualItems) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray);
    doc.text(l1, marginL + 4, ay);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(black);
    doc.text(v1, marginL + 35, ay);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray);
    doc.text(l2, midX + 10, ay);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(black);
    doc.text(v2, midX + 45, ay);
    ay += 4;
  }

  // ──────────────── LEAVE SUMMARY ────────────────
  y += 22;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text("CONGES & ABSENCES", marginL, y);

  y += 3;
  doc.rect(marginL, y, contentW, 14);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray);

  const solde = employee.congesAnnuels - employee.congesPris;
  const leaveLines = [
    `Conges annuels: ${employee.congesAnnuels} j   |   Pris: ${employee.congesPris} j   |   Solde: ${solde} j`,
    `Feries: ${employee.feriados} j   |   Recuperation: ${employee.recuperation} j   |   Repos: ${employee.repos} j   |   Maladie: ${employee.maladieDays} j`,
  ];

  let ly = y + 5.5;
  for (const line of leaveLines) {
    doc.text(line, marginL + 4, ly);
    ly += 5;
  }

  // ──────────────── FOOTER ────────────────
  doc.setFontSize(6);
  doc.setTextColor(lightGray);
  doc.text(
    "Document genere par LuxPayroll 2026 — Simulation indicative — Grand-Duche de Luxembourg",
    pageW / 2, 287,
    { align: "center" },
  );

  // Save
  const safeName = (employee.name || "Employe").replace(/\s+/g, "_");
  doc.save(`Decompte_${safeName}_${period}.pdf`);
};
