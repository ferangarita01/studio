
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
import { getUsers } from "@/services/waste-data-service";
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
  const { 
    companies, 
    isLoading: isCompanyLoading,
    handleDeleteCompany,
    handleAssignUser,
    handleUpdateCompany,
  } = useCompany();
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { role, isLoading: isAuthLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchClients = useCallback(async () => {
    // This now fetches ALL users with the 'client' role.
    const fetchedClients = await getUsers('client');
    setClients(fetchedClients);
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      fetchClients();
    }
  }, [role, fetchClients]);

  const onAssign = async (companyId: string, userId: string | null) => {
      await handleAssignUser(companyId, userId);
      setAssignDialogOpen(false);
  }

  const onUpdate = async (companyId: string, data: Partial<Company>) => {
      await handleUpdateCompany(companyId, data);
      setEditDialogOpen(false);
  }

  const handleOpenAssignDialog = (company: Company) => {
    setSelectedCompany(company);
    setAssignDialogOpen(true);
  };

  const handleOpenEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setEditDialogOpen(true);
  }
  
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
                  {isCompanyLoading ? (
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
                          {clients.find(c => c.id === company.assignedUserUid)?.email || <span className="text-muted-foreground">{dictionary.table.unassigned}</span>}
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
      <AssignUserDialog
        open={isAssignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        dictionary={dictionary.assignDialog}
        clients={clients}
        company={selectedCompany}
        onAssign={onAssign}
      />
      <EditCompanyDialog
        open={isEditDialogOpen}
        onOpenChange={setEditDialogOpen}
        dictionary={dictionary.editDialog}
        company={selectedCompany}
        onUpdate={onUpdate}
      />
    </>
  );
}

    