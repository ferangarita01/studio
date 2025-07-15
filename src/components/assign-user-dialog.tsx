
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Company, UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [selectedClientId, setSelectedClientId] = useState<string | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (company) {
      setSelectedClientId(company.assignedUserUid || null);
    }
  }, [company, open]);

  const handleSubmit = () => {
    if (company) {
      onAssign(company.id, selectedClientId);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedClientId(undefined);
      setSearch("");
    }
    onOpenChange(isOpen);
  };

  if (!company) return null;
  
  const filteredClients = clients.filter(client => 
    client.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const selectedClientEmail = clients.find(c => c.id === selectedClientId)?.email;

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
            <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className="w-full justify-between"
                >
                  {selectedClientId
                    ? selectedClientEmail
                    : dictionary.selectPlaceholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <div className="p-2">
                    <Input
                      placeholder={dictionary.searchPlaceholder}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="p-1">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start font-normal",
                          !selectedClientId && "bg-accent"
                        )}
                        onClick={() => {
                          setSelectedClientId(null);
                          setPopoverOpen(false);
                        }}
                      >
                         <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClientId === null ? "opacity-100" : "opacity-0"
                            )}
                          />
                        {dictionary.unassign}
                      </Button>
                      {filteredClients.map((client) => (
                        <Button
                          key={client.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal",
                             selectedClientId === client.id && "bg-accent"
                          )}
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setPopoverOpen(false);
                          }}
                        >
                           <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClientId === client.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {client.email}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {dictionary.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {dictionary.assign}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
