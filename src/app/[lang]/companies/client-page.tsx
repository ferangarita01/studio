
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
import type { Company, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUsers, assignUserToCompany } from "@/services/waste-data-service";
import { AssignUserDialog } from "@/components/assign-user-dialog";

interface CompaniesClientProps {
  dictionary: Dictionary["companiesPage"];
  initialCompanies: Company[];
}

export function CompaniesClient({ dictionary, initialCompanies }: CompaniesClientProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsClient(true);
    const fetchClients = async () => {
        const clientUsers = await getUsers('client');
        setClients(clientUsers);
    };
    fetchClients();
  }, []);

  const handleOpenDialog = (company: Company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };
  
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
      setDialogOpen(false);
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to assign user.",
        variant: "destructive"
      });
    }
  }, [companies, clients, toast, dictionary]);

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
                    <TableHead className="w-[150px] text-right"><span className="sr-only">{dictionary.table.actions}</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          {company.assignedUserName || <span className="text-muted-foreground">{dictionary.table.unassigned}</span>}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(company)}>
                                {company.assignedUserUid ? dictionary.table.reassign : dictionary.table.assign}
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
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
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        dictionary={dictionary.assignDialog}
        clients={clients}
        company={selectedCompany}
        onAssign={handleAssignUser}
      />
    </>
  );
}

