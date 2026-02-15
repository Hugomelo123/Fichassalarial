import { jsPDF } from "jspdf";
import type { PayrollResult } from "./calculations";

interface EmployeeData {
  name: string;
  role: string;
  ssn: string;
  taxClass?: string;
}

interface CompanyData {
  name: string;
  address: string;
  tva?: string;
}

const MONTHS: Record<string, string> = {
  "01": "Janvier", "02": "Fevrier", "03": "Mars", "04": "Avril",
  "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Aout",
  "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Decembre",
};

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return `${MONTHS[month] || month} ${year}`;
}

export const generatePayslipPDF = (
  employee: EmployeeData,
  company: CompanyData,
  results: PayrollResult,
  salaryMode: "monthly" | "hourly" = "monthly",
  hourlyRate: number = 0,
  hoursWorked: number = 0,
  period: string = "2026-02",
) => {
  const doc = new jsPDF();

  const navy = "#1e293b";
  const gray = "#94a3b8";
  const black = "#0f172a";
  const indigo = "#4f46e5";

  // ── Header ──
  doc.setFillColor(30, 41, 59); // navy
  doc.rect(0, 0, 210, 28, "F");

  doc.setFontSize(16);
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.text("FICHE DE REMUNERATION", 105, 14, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor("#94a3b8");
  doc.text(`Periode : ${formatPeriod(period)}`, 105, 22, { align: "center" });

  // ── Company / Employee ──
  let y = 38;
  doc.setFontSize(9);
  doc.setTextColor(black);
  doc.setFont("helvetica", "bold");
  doc.text(company.name || "Societe", 20, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray);
  doc.text(doc.splitTextToSize(company.address || "", 75), 20, y + 5);
  if (company.tva) doc.text(`TVA : ${company.tva}`, 20, y + 14);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text(employee.name || "Employe", 190, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray);
  doc.text(`${employee.role || "—"}`, 190, y + 5, { align: "right" });
  doc.text(`Matricule : ${employee.ssn || "—"}  |  Classe : ${employee.taxClass || "1"}`, 190, y + 10, { align: "right" });

  // ── Separator ──
  y = 60;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);

  // ── Hours info ──
  if (salaryMode === "hourly" || results.heuresMaladie > 0) {
    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(indigo);
    doc.setFont("helvetica", "bold");

    const parts: string[] = [];
    if (salaryMode === "hourly") parts.push(`Taux : ${hourlyRate.toFixed(2)} EUR/h`);
    parts.push(`Heures normales : ${results.heuresNormales} h`);
    if (results.heuresMaladie > 0) parts.push(`Heures maladie : ${results.heuresMaladie} h`);
    parts.push(`Total : ${results.heuresTotales} h`);

    doc.text(parts.join("   |   "), 105, y, { align: "center" });
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
  }

  // ── Table header ──
  y += 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(gray);
  doc.text("RUBRIQUE", 20, y);
  doc.text("TAUX", 120, y, { align: "right" });
  doc.text("MONTANT (EUR)", 190, y, { align: "right" });

  y += 3;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);

  // ── Table rows ──
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(black);
  doc.setFontSize(9);

  // Gross
  doc.setFont("helvetica", "bold");
  doc.text("Salaire brut mensuel", 20, y);
  doc.text(results.salaryBrut.toFixed(2), 190, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 9;

  // Contributions
  doc.setTextColor(indigo);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("COTISATIONS SOCIALES", 20, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(black);
  doc.setFontSize(9);
  y += 7;

  const socialRows = [
    { label: "Assurance Maladie / Soins", rate: "2.80 %", amount: results.maladieSoins },
    { label: "Assurance Maladie (Especes)", rate: "0.25 %", amount: results.maladieEspeces },
    { label: "Assurance Pension", rate: "8.00 %", amount: results.pension },
    { label: "Assurance Dependance", rate: "1.40 %", amount: results.dependance },
  ];

  for (const row of socialRows) {
    doc.text(row.label, 25, y);
    doc.setTextColor(gray);
    doc.text(row.rate, 120, y, { align: "right" });
    doc.setTextColor(black);
    doc.text(`- ${row.amount.toFixed(2)}`, 190, y, { align: "right" });
    y += 6;
  }

  y += 3;

  // Tax
  doc.setTextColor(indigo);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FISCALITE", 20, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(black);
  doc.setFontSize(9);
  y += 7;

  doc.text("Impot sur salaire (Retenue)", 25, y);
  doc.text(`- ${results.impots.toFixed(2)}`, 190, y, { align: "right" });
  y += 6;

  doc.text("Credit d'impot (CIS / CISSM)", 25, y);
  doc.setTextColor("#059669");
  doc.text(`+ ${results.credit.toFixed(2)}`, 190, y, { align: "right" });
  y += 12;

  // ── Net ──
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(15, y - 4, 180, 16, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#ffffff");
  doc.text("NET A PAYER", 20, y + 7);
  doc.text(`${results.net.toFixed(2)} EUR`, 190, y + 7, { align: "right" });

  // ── Footer ──
  doc.setFontSize(7);
  doc.setTextColor(gray);
  doc.text(
    "Document genere par LuxPayroll 2026 — Simulation indicative",
    105,
    285,
    { align: "center" },
  );

  const safeName = (employee.name || "Employe").replace(/\s+/g, "_");
  doc.save(`Fiche_${safeName}_${period}.pdf`);
};
