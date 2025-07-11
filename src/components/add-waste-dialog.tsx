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
import type { WasteType } from "@/lib/types";

interface AddWasteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddWasteDialog({ open, onOpenChange }: AddWasteDialogProps) {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically handle form submission, e.g., send data to an API
    toast({
        title: "Entry Added",
        description: "Your waste entry has been successfully recorded.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>Add New Waste Entry</DialogTitle>
            <DialogDescription>
                Record a new waste entry. Click save when you're done.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="waste-type" className="text-right">
                Waste Type
                </Label>
                <Select required>
                    <SelectTrigger id="waste-type" className="col-span-3">
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Recycling">Recycling</SelectItem>
                        <SelectItem value="Organic">Organic</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Hazardous">Hazardous</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                Quantity (kg)
                </Label>
                <Input
                id="quantity"
                type="number"
                placeholder="e.g., 25.5"
                className="col-span-3"
                required
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Save Entry</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
