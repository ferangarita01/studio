export type WasteType = "Recycling" | "Organic" | "General" | "Hazardous";

export type WasteEntry = {
  id: string;
  date: Date;
  type: WasteType;
  quantity: number; // in kg
  notes?: string;
};

export type DisposalEvent = {
  id: string;
  date: Date;
  wasteTypes: WasteType[];
  status: "Scheduled" | "Completed" | "Cancelled";
};
