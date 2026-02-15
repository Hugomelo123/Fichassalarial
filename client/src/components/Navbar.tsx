import React from "react";
import { LayoutDashboard, FileText, Settings, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-700 text-white p-1.5 rounded-md font-bold text-xl tracking-tighter">
            LP
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">LuxPayroll <span className="text-blue-600">2026</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Simulateur
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <FileText className="h-4 w-4" />
            Mes Fiches
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <Settings className="h-4 w-4" />
            Paramètres
          </a>
        </div>

        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900">Admin RH</div>
                <div className="text-[10px] text-slate-500">LuxCorp S.A.</div>
            </div>
            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                <UserCircle className="h-5 w-5 text-slate-400" />
            </div>
        </div>
      </div>
    </nav>
  );
}
