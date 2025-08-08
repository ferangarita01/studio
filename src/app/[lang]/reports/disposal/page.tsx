'use client';

import * as React from 'react';
import { useDictionaries } from "@/context/dictionary-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/components/layout/app-shell";
import { useAuth } from "@/context/auth-context";
import { getDisposalCertificates } from "@/services/waste-data-service";
import type { DisposalCertificate } from "@/lib/types";
import { Download, Loader2, PlusCircle } from "lucide-react";
import { UploadCertificateDialog } from '@/components/upload-certificate-dialog';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n-config';

export default function FinalDisposalPage() {
  const dictionary = useDictionaries();
  const { lang, role, isLoading: isAuthLoading } = useAuth();
  const { selectedCompany, isLoading: isCompanyLoading } = useCompany();
  const [certificates, setCertificates] = React.useState<DisposalCertificate[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    // Only fetch if the company context is done loading
    if (isCompanyLoading) return;

    const fetchCertificates = async () => {
      if (!selectedCompany) {
        setCertificates([]);
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(true);
      const fetchedCerts = await getDisposalCertificates(selectedCompany.id);
      setCertificates(fetchedCerts);
      setIsLoadingData(false);
    };

    fetchCertificates();
  }, [selectedCompany, isCompanyLoading]);

  const handleCertificateAdded = (newCertificate: DisposalCertificate) => {
    setCertificates(prev => [newCertificate, ...prev].sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang as Locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const showAdminFeatures = isClient && !isAuthLoading && role === 'admin';
  
  const pageDictionary = dictionary?.reportsPage?.finalDisposal;
  const navDictionary = dictionary?.navigation?.links;

  // Centralized loading check
  if (!isClient || isAuthLoading || !dictionary || !pageDictionary || !navDictionary) {
      return (
         <div className="flex flex-1 items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{navDictionary.finalDisposal}</h1>
          <div className={cn("ml-auto", !showAdminFeatures && "hidden")}>
            <Button size="sm" className="h-8 gap-1" onClick={() => setUploadDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {pageDictionary.uploadButton}
              </span>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{pageDictionary.cardTitle}</CardTitle>
            <CardDescription>
              {pageDictionary.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCompanyLoading ? (
               <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
               </div>
            ) : !selectedCompany ? (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                 <div className="text-center">
                   <p className="text-muted-foreground">{pageDictionary.noCompanySelected}</p>
                 </div>
              </div>
            ) : isLoadingData ? (
               <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                 <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : certificates.length === 0 ? (
               <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {pageDictionary.noCertificates.title}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {pageDictionary.noCertificates.description}
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{pageDictionary.table.fileName}</TableHead>
                    <TableHead>{pageDictionary.table.uploadDate}</TableHead>
                    <TableHead className="text-right">{pageDictionary.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.fileName}</TableCell>
                      <TableCell>{formatDate(cert.uploadedAt)}</TableCell>
                      <TableCell className="text-right">
                         <Button asChild variant="outline" size="sm">
                            <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" download={cert.fileName}>
                              <Download className="mr-2 h-4 w-4" />
                              {pageDictionary.table.download}
                            </a>
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <UploadCertificateDialog
          open={isUploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onCertificateAdded={handleCertificateAdded}
          dictionary={pageDictionary.uploadDialog}
      />
    </>
  );
}
