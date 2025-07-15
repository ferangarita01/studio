
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Company, UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";
import { Label } from "./ui/label";

interface AssignUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary["companiesPage"]["assignDialog"];
  clients: UserProfile[];
  company: Company | null;
  onAssign: (companyId: string, userId: string | null) => void;
}

export function AssignUserDialog({
  open,
  onOpenChange,
  dictionary,
  clients,
  company,
  onAssign,
}: AssignUserDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (company) {
      setSelectedClientId(company.assignedUserUid);
    }
  }, [company, open]);

  const handleSubmit = () => {
    if (company && selectedClientId !== undefined) {
      onAssign(company.id, selectedClientId);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedClientId(undefined);
    }
    onOpenChange(isOpen);
  };
  
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dictionary.title}</DialogTitle>
          <DialogDescription>
            {dictionary.description} <strong>{company.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="client-select">{dictionary.selectLabel}</Label>
                <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                    <SelectTrigger id="client-select">
                        <SelectValue placeholder={dictionary.selectPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">{dictionary.unassign}</SelectItem>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                                {client.email}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {dictionary.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>{dictionary.assign}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    