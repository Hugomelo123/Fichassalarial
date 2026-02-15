import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayrollStore } from "@/store/usePayrollStore";
import { Badge } from "@/components/ui/badge";

export default function AnnualSummary() {
  const { results, salaryBrut } = usePayrollStore();

  if (!results || salaryBrut === 0) return null;

  // Projection simple x12 (sans 13e mois pour simplifier la démo, ou ajustable)
  const annualBrut = salaryBrut * 12;
  const annualNet = results.net * 12;
  const annualTax = results.impots * 12;
  const annualSocial = results.totalSocial * 12;

  return (
    <Card className="mt-6 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Projection Annuelle (2026)</CardTitle>
            <Badge variant="secondary">Estimatif x12</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Montant Annuel</TableHead>
              <TableHead className="text-right hidden sm:table-cell">% du Brut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Salaire Brut Total</TableCell>
              <TableCell className="text-right">€ {annualBrut.toLocaleString('fr-LU', {minimumFractionDigits: 2})}</TableCell>
              <TableCell className="text-right hidden sm:table-cell">100%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-slate-500">Cotisations Sociales</TableCell>
              <TableCell className="text-right text-red-500">- € {annualSocial.toLocaleString('fr-LU', {minimumFractionDigits: 2})}</TableCell>
              <TableCell className="text-right hidden sm:table-cell text-slate-400">
                {((annualSocial / annualBrut) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-slate-500">Impôts sur Revenu</TableCell>
              <TableCell className="text-right text-red-500">- € {annualTax.toLocaleString('fr-LU', {minimumFractionDigits: 2})}</TableCell>
              <TableCell className="text-right hidden sm:table-cell text-slate-400">
                {((annualTax / annualBrut) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow className="bg-green-50/50 font-bold">
              <TableCell className="text-green-900">Net Annuel Poche</TableCell>
              <TableCell className="text-right text-green-700">€ {annualNet.toLocaleString('fr-LU', {minimumFractionDigits: 2})}</TableCell>
              <TableCell className="text-right hidden sm:table-cell text-green-600">
                {((annualNet / annualBrut) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
