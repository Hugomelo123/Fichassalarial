import { PayrollResult } from "./calculations";

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
  period: string = "2026-02"
) => {
  const grossSalary = results.totalImposable + results.totalSocial;
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
      <SalaryData>
        <GrossSalary>${grossSalary.toFixed(2)}</GrossSalary>
        <TaxableIncome>${results.totalImposable.toFixed(2)}</TaxableIncome>
        <SocialContributions>
          <HealthCare>${(grossSalary * 0.028).toFixed(2)}</HealthCare>
          <HealthCash>${(grossSalary * 0.0025).toFixed(2)}</HealthCash>
          <Pension>${(grossSalary * 0.08).toFixed(2)}</Pension>
          <Dependency>${results.dependance.toFixed(2)}</Dependency>
        </SocialContributions>
        <TaxWithheld>${results.impots.toFixed(2)}</TaxWithheld>
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
