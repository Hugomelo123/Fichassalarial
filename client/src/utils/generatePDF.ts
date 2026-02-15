import { jsPDF } from "jspdf";
import { PayrollResult } from "./calculations";

interface EmployeeData {
  name: string;
  role: string;
  ssn: string;
}

interface CompanyData {
  name: string;
  address: string;
}

export const generatePayslipPDF = (
  employee: EmployeeData, 
  company: CompanyData,
  results: PayrollResult,
  period: string = "Février 2026"
) => {
  const doc = new jsPDF();
  
  // Recalculate gross from results
  const salaryBrut = results.totalImposable + results.totalSocial;

  // Individual contribution rates
  const maladieSoins = salaryBrut * 0.028;
  const maladieEspeces = salaryBrut * 0.0025;
  const pension = salaryBrut * 0.08;

  // Colors
  const darkBlue = "#1e3a8a";
  const gray = "#6b7280";
  const black = "#111827";

  // Header
  doc.setFontSize(18);
  doc.setTextColor(darkBlue);
  doc.text("FICHE DE REMUNERATION", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(gray);
  doc.text(`Période: ${period}`, 105, 28, { align: "center" });

  // Company Info (Left)
  doc.setFontSize(10);
  doc.setTextColor(black);
  doc.setFont("helvetica", "bold");
  doc.text(company.name || "Société", 20, 40);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(company.address || "", 80), 20, 46);

  // Employee Info (Right)
  doc.setFont("helvetica", "bold");
  doc.text(employee.name || "Employé", 120, 40);
  doc.setFont("helvetica", "normal");
  doc.text(`Matricule: ${employee.ssn || "N/A"}`, 120, 46);
  doc.text(`Fonction: ${employee.role || "N/A"}`, 120, 52);

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 60, 190, 60);

  // Table Headers
  const yStart = 70;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("RUBRIQUE", 20, yStart);
  doc.text("TAUX", 100, yStart);
  doc.text("MONTANT", 160, yStart, { align: "right" });

  let y = yStart + 10;
  
  // Gross Salary
  doc.setFont("helvetica", "normal");
  doc.text("Salaire de base", 20, y);
  doc.text(`€ ${salaryBrut.toFixed(2)}`, 160, y, { align: "right" });
  y += 10;

  // Social Contributions
  doc.setTextColor(darkBlue);
  doc.setFont("helvetica", "bold");
  doc.text("COTISATIONS SOCIALES", 20, y);
  y += 8;
  doc.setTextColor(black);
  doc.setFont("helvetica", "normal");
  
  doc.text("Assurance Maladie / Soins", 25, y);
  doc.text("2.80%", 100, y);
  doc.text(`- € ${maladieSoins.toFixed(2)}`, 160, y, { align: "right" });
  y += 6;

  doc.text("Assurance Maladie (Espèces)", 25, y);
  doc.text("0.25%", 100, y);
  doc.text(`- € ${maladieEspeces.toFixed(2)}`, 160, y, { align: "right" });
  y += 6;
  
  doc.text("Assurance Pension", 25, y);
  doc.text("8.00%", 100, y);
  doc.text(`- € ${pension.toFixed(2)}`, 160, y, { align: "right" });
  y += 6;

  doc.text("Assurance Dépendance", 25, y);
  doc.text("1.40%", 100, y);
  doc.text(`- € ${results.dependance.toFixed(2)}`, 160, y, { align: "right" });
  y += 10;

  // Taxes
  doc.setTextColor(darkBlue);
  doc.setFont("helvetica", "bold");
  doc.text("IMPOTS", 20, y);
  y += 8;
  doc.setTextColor(black);
  doc.setFont("helvetica", "normal");
  
  doc.text("Impôt sur salaire (Retenue)", 25, y);
  doc.text(`- € ${results.impots.toFixed(2)}`, 160, y, { align: "right" });
  y += 6;
  
  doc.text("CIS / CISSM (Crédit d'impôt)", 25, y);
  doc.text(`+ € ${results.credit.toFixed(2)}`, 160, y, { align: "right" });
  y += 15;

  // Net Result
  doc.setFillColor(240, 248, 255);
  doc.rect(15, y - 5, 180, 15, "F");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkBlue);
  doc.text("NET A PAYER", 20, y + 2);
  doc.text(`€ ${results.net.toFixed(2)}`, 160, y + 2, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(gray);
  doc.text("Document généré automatiquement par LuxPayroll 2026", 105, 280, { align: "center" });

  doc.save(`Fiche_Salaire_${employee.name.replace(/\s+/g, "_") || "Employe"}_2026.pdf`);
};
