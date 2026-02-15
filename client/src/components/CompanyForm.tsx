import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { usePayrollStore } from "@/store/usePayrollStore";

export default function CompanyForm() {
  const { company, setCompany } = usePayrollStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  return (
    <Card className="shadow-sm border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-2 bg-primary/10 rounded-full">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">Données Entreprise</CardTitle>
          <p className="text-sm text-muted-foreground">Informations de l'employeur</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-2">
          <Label htmlFor="companyName">Nom de la Société</Label>
          <Input 
            id="companyName" 
            name="name" 
            value={company.name} 
            onChange={handleChange} 
            placeholder="Ex: LuxCorp S.A." 
            className="bg-background"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="companyAddress">Adresse Complète</Label>
          <Input 
            id="companyAddress" 
            name="address" 
            value={company.address} 
            onChange={handleChange} 
            placeholder="Rue, CP, Ville" 
            className="bg-background"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyTva">N° TVA / Matricule</Label>
          <Input 
            id="companyTva" 
            name="tva" 
            value={company.tva} 
            onChange={handleChange} 
            placeholder="LU..." 
            className="bg-background font-mono"
          />
        </div>
      </CardContent>
    </Card>
  );
}
