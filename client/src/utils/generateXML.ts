import type { PayrollResult } from "./calculations";

interface EmployeeData {
  name: string;
  ssn: string;
  numSecSociale: string;
}

interface CompanyData {
  name: string;
  tva: string;
}

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
    <Index>${results.index.toFixed(2)}</Index>
  </Header>
  <Body>
    <Employee>
      <SSN>${escapeXml(employee.numSecSociale || employee.ssn || "UNKNOWN")}</SSN>
      <Matricule>${escapeXml(employee.ssn || "UNKNOWN")}</Matricule>
      <Name>${escapeXml(employee.name || "UNKNOWN")}</Name>
      <Hours>
        <Normal>${results.heuresNormales}</Normal>
        <SickLeave>${results.heuresMaladie}</SickLeave>
        <Overtime>${results.heuresSupp}</Overtime>
        <Total>${results.heuresTotales}</Total>
      </Hours>
      <SalaryData>
        <BaseSalary>${results.salaireBase.toFixed(2)}</BaseSalary>
        <OvertimeAmount>${results.montantHeuresSupp.toFixed(2)}</OvertimeAmount>
        <GrossSalary>${results.salaryBrut.toFixed(2)}</GrossSalary>
        <TaxableIncome>${results.totalImposable.toFixed(2)}</TaxableIncome>
        <SocialContributions>
          <HealthCare>${results.maladieSoins.toFixed(2)}</HealthCare>
          <HealthCash>${results.maladieEspeces.toFixed(2)}</HealthCash>
          <Pension>${results.pension.toFixed(2)}</Pension>
          <DependencyBase>${results.dependanceBase.toFixed(2)}</DependencyBase>
          <Dependency>${results.dependance.toFixed(2)}</Dependency>
          <Total>${results.totalSocial.toFixed(2)}</Total>
        </SocialContributions>
        <TaxWithheld>${results.impots.toFixed(2)}</TaxWithheld>
        <TaxCredits>
          <CIS>${results.CIS.toFixed(2)}</CIS>
          <CIP>${results.CIP.toFixed(2)}</CIP>
          <CIM>${results.CIM.toFixed(2)}</CIM>
          <CISSM>${results.CISSM.toFixed(2)}</CISSM>
          <CICO2>${results.CICO2.toFixed(2)}</CICO2>
          <Total>${results.totalCredits.toFixed(2)}</Total>
        </TaxCredits>
        <NetSalary>${results.net.toFixed(2)}</NetSalary>
        <TravelExpenses>${results.fraisDeplacement.toFixed(2)}</TravelExpenses>
        <MealVouchers>${results.chequesRepas.toFixed(2)}</MealVouchers>
        <NetToPay>${results.netAPayer.toFixed(2)}</NetToPay>
      </SalaryData>
    </Employee>
  </Body>
</CCSS_Declaration>`;

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
