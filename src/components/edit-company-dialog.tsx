
"use client";

import { useEffect, useState, useRef } from "react";
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
import type { Company, PlanType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { uploadFile, updateCompanyCoverImage, updateCompany } from "@/services/waste-data-service";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (companyId: string, data: { name: string; plan: PlanType }) => void;
  dictionary: Dictionary["companiesPage"]["editDialog"];
  company: Company | null;
}

export function EditCompanyDialog({ open, onOpenChange, onUpdate, dictionary, company }: EditCompanyDialogProps) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<PlanType>("Free");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      setName(company.name);
      setPlan(company.plan || "Free");
    }
  }, [company, open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim() && company) {
      onUpdate(company.id, { name: name.trim(), plan });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && company) {
      setIsUploading(true);
      try {
        const path = `company-covers/${company.id}/${file.name}`;
        const imageUrl = await uploadFile(file, path);
        await updateCompanyCoverImage(company.id, imageUrl);
        
        onUpdate(company.id, { name, plan }); // re-call onUpdate to trigger a re-fetch in the parent

        toast({
          title: "Cover Image Updated",
          description: "The new cover image has been saved."
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Could not upload the new cover image.",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-select" className="text-right">
                {dictionary.planLabel}
              </Label>
              <div className="col-span-3">
                <Select value={plan} onValueChange={(value) => setPlan(value as PlanType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={dictionary.planPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">{dictionary.plans.Free}</SelectItem>
                    <SelectItem value="Premium">{dictionary.plans.Premium}</SelectItem>
                    <SelectItem value="Custom">{dictionary.plans.Custom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cover-image" className="text-right">
                Cover Image
              </Label>
               <div className="col-span-3">
                <Button type="button" variant="outline" onClick={handleUploadClick} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Change Cover
                </Button>
                <Input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                />
              </div>
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
