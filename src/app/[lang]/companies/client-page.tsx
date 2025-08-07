
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
import { getUsers, assignUserToCompany, updateCompany, getCompanies, deleteCompany } from "@/services/waste-data-service";
import { AssignUserDialog } from "@/components/assign-user-dialog";
import { EditCompanyDialog } from "@/components/edit-company-dialog";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCompany } from "@/components/layout/app-shell";

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
  const { user, role, isLoading: isAuthLoading } = useAuth();
  const { setSelectedCompany: setGlobalSelectedCompany } = useCompany();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCompaniesData = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchCompaniesData();
    }
  }, [user, fetchCompaniesData]);

  const handleOpenAssignDialog = (company: Company) => {
    setSelectedCompany(company);
    setAssignDialogOpen(true);
  };

  const handleOpenEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setEditDialogOpen(true);
  }

  const handleDeleteCompany = useCallback(async (companyId: string) => {
    try {
        await deleteCompany(companyId);
        setCompanies(prev => prev.filter(c => c.id !== companyId));
        // Reset global company if it was the one deleted
        setGlobalSelectedCompany(null);
        toast({
            title: dictionary.toast.delete.title,
            description: dictionary.toast.delete.description
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to delete company.",
            variant: "destructive"
        });
    }
  }, [toast, dictionary.toast.delete, setGlobalSelectedCompany]);
  
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
                    <TableHead className={cn("text-right", !showAdminFeatures && "hidden")}><span className="sr-only">{dictionary.table.actions}</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
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
                        <TableCell className={cn("text-right", !showAdminFeatures && "hidden")}>
                           <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenEditDialog(company)}>{dictionary.table.edit}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenAssignDialog(company)}>
                                    {company.assignedUserUid ? dictionary.table.reassign : dictionary.table.assign}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                      <AlertDialogTrigger className="w-full text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {dictionary.table.delete}
                                      </AlertDialogTrigger>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>{dictionary.deleteDialog.title}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      {dictionary.deleteDialog.description}
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>{dictionary.deleteDialog.cancel}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCompany(company.id)}>{dictionary.deleteDialog.confirm}</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
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
    </>
  );
}
