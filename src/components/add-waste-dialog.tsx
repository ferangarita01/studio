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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Dictionary } from "@/lib/get-dictionary";

interface AddWasteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dictionary: Dictionary["logPage"]["addWasteDialog"];
}

export function AddWasteDialog({ open, onOpenChange, dictionary }: AddWasteDialogProps) {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
        title: dictionary.toast.title,
        description: dictionary.toast.description,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>{dictionary.title}</DialogTitle>
            <DialogDescription>
                {dictionary.description}
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="waste-type" className="text-right">
                {dictionary.wasteType}
                </Label>
                <Select required>
                    <SelectTrigger id="waste-type" className="col-span-3">
                        <SelectValue placeholder={dictionary.selectType} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Recycling">{dictionary.types.Recycling}</SelectItem>
                        <SelectItem value="Organic">{dictionary.types.Organic}</SelectItem>
                        <SelectItem value="General">{dictionary.types.General}</SelectItem>
                        <SelectItem value="Hazardous">{dictionary.types.Hazardous}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                {dictionary.quantity}
                </Label>
                <Input
                id="quantity"
                type="number"
                placeholder={dictionary.quantityPlaceholder}
                className="col-span-3"
                required
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">{dictionary.save}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
