import React from "react";
import Navbar from "@/components/Navbar";
import CompanyForm from "@/components/CompanyForm";
import EmployeeForm from "@/components/EmployeeForm";
import SalaryBreakdown from "@/components/SalaryBreakdown";
import PayslipPreview from "@/components/PayslipPreview";
import AnnualSummary from "@/components/AnnualSummary";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Real-time Calc */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1 mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Calculateur Salaire</h1>
              <p className="text-slate-500 text-lg">
                Simulez les fiches de paie selon les barèmes 2026.
              </p>
            </div>

            <CompanyForm />
            <EmployeeForm />
            <SalaryBreakdown />
          </div>

          {/* Right Column: Preview & Documents */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-1 h-full min-h-[600px]">
               <PayslipPreview />
            </div>
            <AnnualSummary />
          </div>

        </div>
      </main>
    </div>
  );
}
