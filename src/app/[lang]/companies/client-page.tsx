
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Company, UserProfile, PlanType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUsers, assignUserToCompany, updateCompany, getCompanies } from "@/services/waste-data-service";
import { AssignUserDialog } from "@/components/assign-user-dialog";
import { EditCompanyDialog } from "@/components/edit-company-dialog";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompaniesClientProps {
  dictionary: Dictionary["companiesPage"];
}

export function CompaniesClient({ dictionary }: CompaniesClientProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const { role, isLoading: isAuthLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCompaniesData = useCallback(async () => {
    setIsLoading(true);
    const [fetchedCompanies, fetchedClients] = await Promise.all([
      getCompanies(),
      getUsers('client')
    ]);

    const clientMap = new Map(fetchedClients.map(client => [client.id, client.email]));
    
    const companiesWithClientNames = fetchedCompanies.map(company => ({
        ...company,
        assignedUserName: company.assignedUserUid ? clientMap.get(company.assignedUserUid) : undefined
    }));

    setCompanies(companiesWithClientNames);
    setClients(fetchedClients);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCompaniesData();
  }, [fetchCompaniesData]);

  const handleOpenAssignDialog = (company: Company) => {
    setSelectedCompany(company);
    setAssignDialogOpen(true);
  };

  const handleOpenEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setEditDialogOpen(true);
  }
  
  const handleAssignUser = useCallback(async (companyId: string, userId: string | null) => {
    try {
      await assignUserToCompany(companyId, userId);
      
      const updatedCompanies = companies.map(c => {
        if (c.id === companyId) {
          const assignedUser = clients.find(client => client.id === userId);
          return { ...c, assignedUserUid: userId || undefined, assignedUserName: assignedUser?.email || undefined };
        }
        return c;
      });
      setCompanies(updatedCompanies);

      toast({
        title: dictionary.toast.assign.title,
        description: dictionary.toast.assign.description,
      });
      setAssignDialogOpen(false);
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to assign user.",
        variant: "destructive"
      });
    }
  }, [companies, clients, toast, dictionary]);

  const handleUpdateCompany = useCallback(async (companyId: string, data: { name: string; plan: PlanType }) => {
    try {
      await updateCompany(companyId, data);
      setCompanies(prevCompanies => prevCompanies.map(c => 
        c.id === companyId ? { ...c, ...data } : c
      ));
      toast({
        title: dictionary.toast.update.title,
        description: dictionary.toast.update.description,
      });
      setEditDialogOpen(false);
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to update company.",
        variant: "destructive"
      });
    }
  }, [toast, dictionary]);

  const showAdminFeatures = isClient && !isAuthLoading && role === 'admin';

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.cardTitle}</CardTitle>
            <CardDescription>{dictionary.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dictionary.table.companyName}</TableHead>
                    <TableHead>{dictionary.table.assignedClient}</TableHead>
                    <TableHead>{dictionary.table.plan}</TableHead>
                    <TableHead className={cn("w-[250px] text-right", !showAdminFeatures && "hidden")}><span className="sr-only">{dictionary.table.actions}</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={showAdminFeatures ? 4 : 3} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : companies.length > 0 ? (
                    companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          {company.assignedUserName || <span className="text-muted-foreground">{dictionary.table.unassigned}</span>}
                        </TableCell>
                        <TableCell>
                            <Badge variant={company.plan === 'Premium' ? 'default' : 'secondary'}>{company.plan || 'Free'}</Badge>
                        </TableCell>
                        <TableCell className={cn("text-right space-x-2", !showAdminFeatures && "hidden")}>
                            <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(company)}>
                                {dictionary.table.edit}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleOpenAssignDialog(company)}>
                                {company.assignedUserUid ? dictionary.table.reassign : dictionary.table.assign}
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={showAdminFeatures ? 4 : 3} className="h-24 text-center">
                        {dictionary.noCompanies}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className={cn(!showAdminFeatures && "hidden")}>
          <AssignUserDialog
            open={isAssignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            dictionary={dictionary.assignDialog}
            clients={clients}
            company={selectedCompany}
            onAssign={handleAssignUser}
          />
          <EditCompanyDialog
            open={isEditDialogOpen}
            onOpenChange={setEditDialogOpen}
            dictionary={dictionary.editDialog}
            company={selectedCompany}
            onUpdate={handleUpdateCompany}
          />
      </div>
    </>
  );
}
