export interface PayrollResult {
  cotisations: number;
  dependance: number;
  totalSocial: number;
  totalImposable: number;
  impots: number;
  credit: number;
  net: number;
}

export const calculateLuxSalary = (salaryBrut: number): PayrollResult => {
  const rates = {
    maladieSoins: 0.028,        // 2.80%
    maladieEspeces: 0.0025,     // 0.25%
    pension: 0.08,              // 8.00%
    dependance: 0.014,          // 1.40%
  };

  const cotisations = salaryBrut * (rates.maladieSoins + rates.maladieEspeces + rates.pension);
  const dependance = salaryBrut * rates.dependance;
  const totalSocial = cotisations + dependance;
  const totalImposable = salaryBrut - totalSocial;

  // Placeholder average tax rate (adjustable via tax bracket logic later)
  const impotsRate = 0.0842; 
  const impots = totalImposable * impotsRate;
  const credit = 58; // Fixed tax credit example

  const net = totalImposable - impots + credit;

  return {
    cotisations: Number(cotisations.toFixed(2)),
    dependance: Number(dependance.toFixed(2)),
    totalSocial: Number(totalSocial.toFixed(2)),
    totalImposable: Number(totalImposable.toFixed(2)),
    impots: Number(impots.toFixed(2)),
    credit,
    net: Number(net.toFixed(2))
  };
};
