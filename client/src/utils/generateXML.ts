import type { PayrollResult } from "./calculations";

interface EmployeeData {
  name: string;
  ssn: string;
}

interface CompanyData {
  name: string;
  tva: string;
}

/** Escape special XML characters */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const generateCCSSXML = (
  employee: EmployeeData,
  company: CompanyData,
  results: PayrollResult,
  period: string = "2026-02",
) => {
  const dateCreated = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CCSS_Declaration>
  <Header>
    <SenderID>${escapeXml(company.tva || "UNKNOWN")}</SenderID>
    <Period>${escapeXml(period)}</Period>
    <DateCreated>${dateCreated}</DateCreated>
  </Header>
  <Body>
    <Employee>
      <SSN>${escapeXml(employee.ssn || "UNKNOWN")}</SSN>
      <Name>${escapeXml(employee.name || "UNKNOWN")}</Name>
      <Hours>
        <Normal>${results.heuresNormales}</Normal>
        <SickLeave>${results.heuresMaladie}</SickLeave>
        <Total>${results.heuresTotales}</Total>
      </Hours>
      <SalaryData>
        <GrossSalary>${results.salaryBrut.toFixed(2)}</GrossSalary>
        <TaxableIncome>${results.totalImposable.toFixed(2)}</TaxableIncome>
        <SocialContributions>
          <HealthCare>${results.maladieSoins.toFixed(2)}</HealthCare>
          <HealthCash>${results.maladieEspeces.toFixed(2)}</HealthCash>
          <Pension>${results.pension.toFixed(2)}</Pension>
          <Dependency>${results.dependance.toFixed(2)}</Dependency>
        </SocialContributions>
        <TaxWithheld>${results.impots.toFixed(2)}</TaxWithheld>
        <TaxCredit>${results.credit.toFixed(2)}</TaxCredit>
        <NetSalary>${results.net.toFixed(2)}</NetSalary>
      </SalaryData>
    </Employee>
  </Body>
</CCSS_Declaration>`;

  // Trigger download
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CCSS_Export_${period}_${employee.ssn || "emp"}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
