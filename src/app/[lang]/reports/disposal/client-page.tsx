
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/components/layout/app-shell";
import { useAuth } from "@/context/auth-context";
import type { DisposalCertificate } from "@/lib/types";
import { Download, Loader2, PlusCircle, Mail } from "lucide-react";
import { UploadCertificateDialog } from '@/components/upload-certificate-dialog';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n-config';
import type { Dictionary } from '@/lib/get-dictionary';
import { getDisposalCertificates, sendCertificateByEmail } from '@/services/waste-data-service';
import { useToast } from '@/hooks/use-toast';

type PageDictionary = Dictionary["reportsPage"]["finalDisposal"];
type NavDictionary = Dictionary["navigation"]["links"];

interface FinalDisposalClientProps {
  dictionary: PageDictionary;
  navDictionary: NavDictionary;
  lang: Locale;
}

export function FinalDisposalClient({ dictionary, navDictionary, lang }: FinalDisposalClientProps) {
  const { role, isLoading: isAuthLoading } = useAuth();
  const { selectedCompany, isLoading: isCompanyLoading } = useCompany();
  const [certificates, setCertificates] = React.useState<DisposalCertificate[]>([]);
  const [isClient, setIsClient] = React.useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isSendingEmail, setIsSendingEmail] = React.useState<string | null>(null);
  const { toast } = useToast();


  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  React.useEffect(() => {
    const fetchCertificates = async () => {
      if (selectedCompany) {
        setIsLoadingData(true);
        const fetchedCerts = await getDisposalCertificates(selectedCompany.id);
        setCertificates(fetchedCerts);
        setIsLoadingData(false);
      } else {
        setCertificates([]);
        setIsLoadingData(false);
      }
    };
    
    // Don't fetch until the company context is ready.
    if (!isCompanyLoading) {
      fetchCertificates();
    }
  }, [selectedCompany, isCompanyLoading]);


  const handleCertificateAdded = (newCertificate: DisposalCertificate) => {
    setCertificates(prev => [newCertificate, ...prev].sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
  };

  const handleSendEmail = async (certificateId: string) => {
    if (!selectedCompany) return;
    setIsSendingEmail(certificateId);
    try {
        await sendCertificateByEmail(certificateId, selectedCompany.id);
        toast({
            title: dictionary.toast.emailSent.title,
            description: dictionary.toast.emailSent.description,
        });
    } catch (error) {
        toast({
            title: dictionary.toast.emailError.title,
            description: dictionary.toast.emailError.description,
            variant: "destructive"
        });
    } finally {
        setIsSendingEmail(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const showAdminFeatures = isClient && !isAuthLoading && role === 'admin';
  
  const renderContent = () => {
    if (isCompanyLoading || isLoadingData) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    if (!selectedCompany) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
          <div className="text-center">
            <p className="text-muted-foreground">{dictionary.noCompanySelected}</p>
          </div>
        </div>
      );
    }
    
    if (certificates.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              {dictionary.noCertificates.title}
            </h3>
            <p className="text-muted-foreground mt-2">
              {dictionary.noCertificates.description}
            </p>
          </div>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dictionary.table.fileName}</TableHead>
            <TableHead>{dictionary.table.uploadDate}</TableHead>
            <TableHead className="text-right">{dictionary.table.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.map((cert) => (
            <TableRow key={cert.id}>
              <TableCell className="font-medium">{cert.fileName}</TableCell>
              <TableCell>{formatDate(cert.uploadedAt)}</TableCell>
              <TableCell className="text-right space-x-2">
                 <Button onClick={() => handleSendEmail(cert.id)} variant="outline" size="sm" disabled={!!isSendingEmail}>
                    {isSendingEmail === cert.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Mail className="mr-2 h-4 w-4" />
                    )}
                    {dictionary.table.sendEmail}
                 </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" download={cert.fileName}>
                    <Download className="mr-2 h-4 w-4" />
                    {dictionary.table.download}
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{navDictionary.finalDisposal}</h1>
          <div className={cn("ml-auto", !showAdminFeatures && "hidden")}>
            <Button size="sm" className="h-8 gap-1" onClick={() => setUploadDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {dictionary.uploadButton}
              </span>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.cardTitle}</CardTitle>
            <CardDescription>
              {dictionary.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
             {renderContent()}
          </CardContent>
        </Card>
      </div>
      <UploadCertificateDialog
          open={isUploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onCertificateAdded={handleCertificateAdded}
          dictionary={dictionary.uploadDialog}
      />
    </>
  );
}
