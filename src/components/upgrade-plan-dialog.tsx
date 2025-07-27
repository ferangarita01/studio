
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Dictionary } from "@/lib/get-dictionary";
import { Star, Zap } from "lucide-react";
import type { Locale } from "@/i18n-config";

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary["navigation"]["upgradeDialog"];
  lang: Locale;
}

export function UpgradePlanDialog({ open, onOpenChange, dictionary, lang }: UpgradePlanDialogProps) {
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-yellow-500" />
                </div>
            </div>
            <DialogTitle className="text-center">{dictionary.title}</DialogTitle>
            <DialogDescription className="text-center">
                {dictionary.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{dictionary.features.ai}</span>
                </li>
                 <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{dictionary.features.compliance}</span>
                </li>
                 <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{dictionary.features.reports}</span>
                </li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {dictionary.cancel}
            </Button>
            <Button asChild onClick={() => onOpenChange(false)}>
                <Link href={`/${lang}/pricing`}>{dictionary.confirm}</Link>
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
