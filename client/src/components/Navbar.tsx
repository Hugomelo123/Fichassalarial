import { Calculator } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-200">
              <Calculator className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                LuxPayroll
              </span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                2026
              </span>
            </div>
          </div>

          {/* Tagline */}
          <p className="hidden text-xs text-slate-400 sm:block">
            Simulateur de fiches de paie &middot; Grand-Duche de Luxembourg
          </p>
        </div>
      </div>
    </nav>
  );
}
