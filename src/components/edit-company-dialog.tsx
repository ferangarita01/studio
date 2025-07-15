
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Company } from "@/lib/types";

interface EditCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (companyId: string, newName: string) => void;
  dictionary: Dictionary["companiesPage"]["editDialog"];
  company: Company | null;
}

export function EditCompanyDialog({ open, onOpenChange, onUpdate, dictionary, company }: EditCompanyDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (company) {
      setName(company.name);
    }
  }, [company, open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim() && company) {
      onUpdate(company.id, name.trim());
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dictionary.title}</DialogTitle>
            <DialogDescription>{dictionary.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-name" className="text-right">
                {dictionary.nameLabel}
              </Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={dictionary.namePlaceholder}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {dictionary.cancel}
            </Button>
            <Button type="submit">{dictionary.update}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
