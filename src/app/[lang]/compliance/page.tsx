
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Database, Download, Plus, Search, Factory, Zap, Car, Building2, HardHat, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDictionaries } from '@/context/dictionary-context';
import { getEmissionFactors, addValorizedResidue, getValorizedResidues } from '@/services/waste-data-service';
import type { EmissionFactor, ValorizedResidue } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { ValorizedResidueDialog } from '@/components/valorized-residue-dialog';
import { useToast } from '@/hooks/use-toast';


const GHGReportingSystem = () => {
  const dictionary = useDictionaries();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('database');
  const [selectedStandard, setSelectedStandard] = useState('iso14064');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState({
    organizacion: '',
    periodo: new Date().getFullYear().toString(),
    limiteOrganizacional: 'control-operacional',
  });
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [valorizedResidues, setValorizedResidues] = useState<ValorizedResidue[]>([]);
  const [isResidueDialogOpen, setResidueDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const d = dictionary?.compliancePage;
  const dialogDictionary = dictionary?.valorizedResidueDialog;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const factors = await getEmissionFactors();
      setEmissionFactors(factors);
      if (user) {
        const residues = await getValorizedResidues(user.uid);
        setValorizedResidues(residues);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  const filteredFactors = useMemo(() => {
    return emissionFactors.filter(factor =>
      factor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factor.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factor.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, emissionFactors]);

  const totalEmissionsAvoided = useMemo(() => {
    return valorizedResidues.reduce((acc, residue) => acc + residue.emissionsAvoided, 0);
  }, [valorizedResidues]);

  const handleResidueAdded = (newResidue: ValorizedResidue) => {
    setValorizedResidues(prev => [newResidue, ...prev]);
    toast({
        title: dialogDictionary?.toast?.title || "Success",
        description: dialogDictionary?.toast?.description || "Residue added successfully.",
    });
  };

  const generateReport = () => {
    // Implement report generation logic here
    console.log("Generating report with data:", reportData, "and standard:", selectedStandard);
    toast({ title: "Función en desarrollo", description: "La generación de reportes se implementará próximamente." });
  };

  const getCategoryIcon = (categoria?: string) => {
    switch (categoria) {
      case 'Combustibles': return <Factory className="w-4 h-4" />;
      case 'Electricidad': return <Zap className="w-4 h-4" />;
      case 'Transporte': return <Car className="w-4 h-4" />;
      case 'Materiales': return <HardHat className="w-4 h-4" />;
      case 'Residuos': return <Recycle className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getScopeColor = (scope?: number) => {
    switch (scope) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!d || !dialogDictionary) return <div>Loading dictionary...</div>;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-0 md:p-6">
        <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{d.reportingSystem.title}</h1>
              <p className="text-muted-foreground">{d.reportingSystem.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveTab('database')}
              variant={activeTab === 'database' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Database className="w-5 h-5" />
              {d.tabs.database}
            </Button>
            <Button
              onClick={() => setActiveTab('valorized')}
              variant={activeTab === 'valorized' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Recycle className="w-5 h-5" />
              {d.tabs.valorizedResidues}
            </Button>
            <Button
              onClick={() => setActiveTab('reports')}
              variant={activeTab === 'reports' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {d.tabs.reports}
            </Button>
          </div>
        </div>

        {activeTab === 'database' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{d.database.title}</CardTitle>
              <div className="relative mt-2">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={d.database.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredFactors.map((factor) => (
                  <div key={factor.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-muted rounded-lg mt-1">
                          {getCategoryIcon(factor.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-foreground">{factor.subcategory}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScopeColor(factor.scope)}`}>
                              {d.scope} {factor.scope}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{factor.category}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                            <div><span className="font-medium">{d.database.factor}:</span> <span className="ml-1 text-primary font-mono">{factor.factor.toLocaleString()}</span></div>
                            <div><span className="font-medium">{d.database.unit}:</span> <span className="ml-1">{factor.unit}</span></div>
                            <div><span className="font-medium">{d.database.region}:</span> <span className="ml-1">{factor.region}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-xs text-muted-foreground">{d.database.source}</p>
                        <p className="text-sm font-medium">{factor.source}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredFactors.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4" />
                  <p>{d.database.noResults}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'valorized' && (
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{d.valorized.title}</CardTitle>
                        <CardDescription>{d.valorized.description}</CardDescription>
                    </div>
                    <Button onClick={() => setResidueDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {d.valorized.addButton}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-primary">{d.valorized.totalAvoided.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{(totalEmissionsAvoided / 1000).toFixed(4)} tCO2e</p>
                        <p className="text-muted-foreground">{d.valorized.totalAvoided.description}</p>
                    </CardContent>
                </Card>
                <h4 className="font-semibold mb-4">{d.valorized.listTitle}</h4>
                <div className="space-y-3">
                    {valorizedResidues.length > 0 ? valorizedResidues.map(residue => (
                        <div key={residue.id} className="border p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{residue.type}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(residue.date).toLocaleDateString()} - {residue.quantity} {residue.unit}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">{residue.emissionsAvoided.toFixed(2)} kg CO2e</p>
                                <p className="text-xs text-muted-foreground">{d.valorized.avoided}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center py-4">{d.valorized.noResidues}</p>
                    )}
                </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reports' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{d.reports.title}</CardTitle>
              <CardDescription>{d.reports.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{d.reports.standardLabel}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={() => setSelectedStandard('iso14064')} variant={selectedStandard === 'iso14064' ? 'default' : 'outline'} className="h-auto py-3"><div className="text-center"><FileText className="w-6 h-6 mx-auto mb-1" /><p className="font-medium text-xs">ISO 14064-1:2018</p></div></Button>
                      <Button onClick={() => setSelectedStandard('ghg')} variant={selectedStandard === 'ghg' ? 'default' : 'outline'} className="h-auto py-3"><div className="text-center"><Building2 className="w-6 h-6 mx-auto mb-1" /><p className="font-medium text-xs">GHG Protocol</p></div></Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{d.reports.orgInfoLabel}</label>
                    <Input placeholder={d.reports.orgNamePlaceholder} value={reportData.organizacion} onChange={(e) => setReportData({...reportData, organizacion: e.target.value})} className="mb-2" />
                    <Input placeholder={d.reports.periodPlaceholder} value={reportData.periodo} onChange={(e) => setReportData({...reportData, periodo: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">{d.reports.limitLabel}</label>
                    <Select value={reportData.limiteOrganizacional} onValueChange={(value) => setReportData({...reportData, limiteOrganizacional: value})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="control-operacional">{d.reports.limits.operational}</SelectItem>
                        <SelectItem value="control-financiero">{d.reports.limits.financial}</SelectItem>
                        <SelectItem value="participacion-accionaria">{d.reports.limits.equity}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">{d.reports.previewTitle}</h3>
                        <div className="bg-background rounded-lg p-4 shadow-sm text-sm space-y-1">
                            <p><strong>{d.reports.standardLabel}:</strong> {selectedStandard === 'iso14064' ? 'ISO 14064-1:2018' : 'GHG Protocol'}</p>
                            <p><strong>{d.reports.orgNamePlaceholder}:</strong> {reportData.organizacion || 'N/A'}</p>
                            <p><strong>{d.reports.periodPlaceholder}:</strong> {reportData.periodo || 'N/A'}</p>
                        </div>
                    </div>
                  <Button onClick={generateReport} className="w-full mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    {d.reports.generateButton}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

       <ValorizedResidueDialog
          open={isResidueDialogOpen}
          onOpenChange={setResidueDialogOpen}
          dictionary={dialogDictionary}
          emissionFactors={emissionFactors}
          onResidueAdded={handleResidueAdded}
        />
    </div>
  );
};

export default GHGReportingSystem;
