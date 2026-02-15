import { usePayrollStore } from "@/store/usePayrollStore";

export default function SalaryBreakdown() {
  const { results } = usePayrollStore();

  if (!results || results.salaryBrut === 0) {
    return (
      <p className="py-6 text-center text-xs text-slate-400">
        En attente de donnees...
      </p>
    );
  }

  const total = results.salaryBrut;
  const pct = (v: number) => ((v / total) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Gross */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-800">Salaire brut</span>
        <span className="font-mono font-bold text-slate-900">{results.salaryBrut.toFixed(2)}</span>
      </div>

      {results.montantHeuresSupp > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>dont H.S. ({results.heuresSupp}h)</span>
          <span className="font-mono">+ {results.montantHeuresSupp.toFixed(2)}</span>
        </div>
      )}

      {/* Visual bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-red-400" style={{ width: `${pct(results.totalSocial)}%` }} />
        <div className="bg-orange-400" style={{ width: `${pct(results.impots)}%` }} />
        {results.fraisDeplacement > 0 && <div className="bg-blue-400" style={{ width: `${pct(results.fraisDeplacement)}%` }} />}
        <div className="bg-emerald-500" style={{ width: `${pct(results.netAPayer)}%` }} />
      </div>
      <div className="flex flex-wrap gap-2 text-[10px]">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Social {pct(results.totalSocial)}%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" />Impots {pct(results.impots)}%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Net {pct(results.netAPayer)}%</span>
      </div>

      {/* Cotisations sociales */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Cotisations sociales</p>
        <Row label="Maladie / Soins" rate="2.80%" value={results.maladieSoins} />
        <Row label="Maladie / Especes" rate="0.25%" value={results.maladieEspeces} />
        <Row label="Pension" rate="8.00%" value={results.pension} />
        <Row label="Dependance" rate="1.40%" value={results.dependance} sub={`base: ${results.dependanceBase.toFixed(2)}`} />
        <div className="flex items-center justify-between py-1 text-xs font-semibold">
          <span className="text-slate-700">Total cotisations</span>
          <span className="font-mono text-red-500">- {results.totalSocial.toFixed(2)}</span>
        </div>
      </div>

      {/* Fiscalité */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Fiscalite</p>
        <Row label="Revenu imposable" value={results.totalImposable} neutral />
        <Row label="Impot retenu (RTS)" value={results.impots} />
        <div className="mt-1 space-y-0.5">
          {results.CIS > 0 && <CreditRow label="CIS" value={results.CIS} />}
          {results.CIP > 0 && <CreditRow label="CIP" value={results.CIP} />}
          {results.CIM > 0 && <CreditRow label="CIM" value={results.CIM} />}
          {results.CISSM > 0 && <CreditRow label="CISSM" value={results.CISSM} />}
        </div>
      </div>

      {/* Adjustments */}
      {(results.fraisDeplacement > 0 || results.chequesRepas > 0 || results.autresAvantages > 0 || results.autresDeductions > 0) && (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Ajustements</p>
          {results.fraisDeplacement > 0 && <CreditRow label="Frais deplacement" value={results.fraisDeplacement} />}
          {results.autresAvantages > 0 && <CreditRow label="Autres avantages" value={results.autresAvantages} />}
          {results.chequesRepas > 0 && <Row label="Cheques repas" value={results.chequesRepas} />}
          {results.autresDeductions > 0 && <Row label="Autres deductions" value={results.autresDeductions} />}
        </div>
      )}

      {/* Net A Payer */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-200">Net a payer</p>
        <p className="font-mono text-xl font-bold">{results.netAPayer.toFixed(2)} <span className="text-sm font-normal text-emerald-200">EUR</span></p>
      </div>
    </div>
  );
}

function Row({ label, rate, value, sub, neutral }: { label: string; rate?: string; value: number; sub?: string; neutral?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-xs">
      <span className="text-slate-500">
        {label}
        {rate && <span className="ml-1 text-slate-300">({rate})</span>}
        {sub && <span className="ml-1 text-[10px] text-slate-300">[{sub}]</span>}
      </span>
      <span className={`font-mono font-medium ${neutral ? "text-slate-600" : "text-red-500"}`}>
        {neutral ? value.toFixed(2) : `- ${value.toFixed(2)}`}
      </span>
    </div>
  );
}

function CreditRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-medium text-emerald-600">+ {value.toFixed(2)}</span>
    </div>
  );
}
