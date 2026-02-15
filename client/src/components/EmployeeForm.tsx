import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Euro } from "lucide-react";
import { usePayrollStore } from "@/store/usePayrollStore";

export default function EmployeeForm() {
  const { employee, setEmployee, salaryBrut, setSalary } = usePayrollStore();

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setSalary(val);
  };

  return (
    <Card className="shadow-sm border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
          <User className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-lg">Données Salarié</CardTitle>
          <p className="text-sm text-muted-foreground">Informations personnelles et contractuelles</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="empName">Nom Complet</Label>
            <Input 
              id="empName" 
              name="name" 
              value={employee.name} 
              onChange={handleEmployeeChange} 
              placeholder="Jean Dupont" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="empSsn">N° Matricule (CCSS)</Label>
            <Input 
              id="empSsn" 
              name="ssn" 
              value={employee.ssn} 
              onChange={handleEmployeeChange} 
              placeholder="YYYYMMDD-XXXXX" 
              className="font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="empRole">Fonction</Label>
            <Input 
              id="empRole" 
              name="role" 
              value={employee.role} 
              onChange={handleEmployeeChange} 
              placeholder="Développeur Senior" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxClass">Classe d'Impôt</Label>
            <Select 
              value={employee.taxClass} 
              onValueChange={(val) => setEmployee({...employee, taxClass: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Classe 1 (Célibataire)</SelectItem>
                <SelectItem value="1a">Classe 1a (Veuf/Séparé)</SelectItem>
                <SelectItem value="2">Classe 2 (Marié/Pacsé)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Label htmlFor="salaryBrut" className="text-base font-semibold flex items-center gap-2">
            <Euro className="h-4 w-4 text-green-600" /> 
            Salarie Brut Mensuel (€)
          </Label>
          <div className="mt-2 relative">
            <Input 
              id="salaryBrut" 
              type="number" 
              value={salaryBrut || ""} 
              onChange={handleSalaryChange} 
              className="pl-8 text-lg font-mono font-bold text-green-700"
              placeholder="0.00"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Entrez le montant brut pour calculer automatiquement les retenues.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
