import type { WasteEntry, DisposalEvent, WasteType } from "./types";

export const wasteLog: WasteEntry[] = [
  { id: "1", date: new Date("2024-05-20"), type: "Recycling", quantity: 15.5 },
  { id: "2", date: new Date("2024-05-20"), type: "Organic", quantity: 30.2 },
  { id: "3", date: new Date("2024-05-19"), type: "General", quantity: 55.0 },
  { id: "4", date: new Date("2024-05-18"), type: "Recycling", quantity: 22.1 },
  { id: "5", date: new Date("2024-05-17"), type: "Hazardous", quantity: 2.5 },
  { id: "6", date: new Date("2024-05-16"), type: "Organic", quantity: 28.0 },
];

export const upcomingDisposals: DisposalEvent[] = [
  {
    id: "disp1",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    wasteTypes: ["General", "Recycling"],
    status: "Scheduled",
  },
  {
    id: "disp2",
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    wasteTypes: ["Organic"],
    status: "Scheduled",
  },
  {
    id: "disp3",
    date: new Date(new Date().setDate(new Date().getDate() + 14)),
    wasteTypes: ["Hazardous"],
    status: "Scheduled",
  },
];


export const wasteData = [
  { month: "January", recycling: 186, organic: 80, general: 240 },
  { month: "February", recycling: 305, organic: 200, general: 280 },
  { month: "March", recycling: 237, organic: 120, general: 320 },
  { month: "April", recycling: 273, organic: 190, general: 310 },
  { month: "May", recycling: 209, organic: 130, general: 290 },
  { month: "June", recycling: 214, organic: 140, general: 330 },
];
