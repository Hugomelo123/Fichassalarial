import { create } from "xmlbuilder2";
import { PayrollResult } from "./calculations";

interface EmployeeData {
  name: string;
  ssn: string;
}

interface CompanyData {
  name: string;
  tva: string;
}

export const generateCCSSXML = (
  employee: EmployeeData, 
  company: CompanyData,
  results: PayrollResult,
  period: string = "2026-02"
) => {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('CCSS_Declaration')
      .ele('Header')
        .ele('SenderID').txt(company.tva || "UNKNOWN").up()
        .ele('Period').txt(period).up()
        .ele('DateCreated').txt(new Date().toISOString().split('T')[0]).up()
      .up()
      .ele('Body')
        .ele('Employee')
          .ele('SSN').txt(employee.ssn || "UNKNOWN").up()
          .ele('Name').txt(employee.name || "UNKNOWN").up()
          .ele('SalaryData')
            .ele('GrossSalary').txt((results.totalImposable + results.totalSocial).toFixed(2)).up()
            .ele('TaxableIncome').txt(results.totalImposable.toFixed(2)).up()
            .ele('SocialContributions')
              .ele('Health').txt((results.cotisations * 0.028 / 0.1105).toFixed(2)).up()
              .ele('Pension').txt((results.cotisations * 0.08 / 0.1105).toFixed(2)).up()
              .ele('Dependency').txt(results.dependance.toFixed(2)).up()
            .up()
            .ele('TaxWithheld').txt(results.impots.toFixed(2)).up()
            .ele('NetSalary').txt(results.net.toFixed(2)).up()
          .up()
        .up()
      .up()
    .up();

  const xml = doc.end({ prettyPrint: true });
  
  // Trigger download
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CCSS_Export_${period}_${employee.ssn || "emp"}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
