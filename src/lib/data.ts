import type { WasteEntry, DisposalEvent, ReportData } from "./types";

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

export const weeklyReportData: ReportData = {
  totalCosts: 450.75,
  totalIncome: 620.50,
  netResult: 169.75,
  chartData: [
    { name: 'Week 1', costs: 120, income: 150 },
    { name: 'Week 2', costs: 110, income: 180 },
    { name: 'Week 3', costs: 125, income: 160 },
    { name: 'Week 4', costs: 95.75, income: 130.50 },
  ],
  transactions: [
    { id: 'inc1', date: '2024-07-28', description: 'Sale of Plastic #1', amount: 85.50, type: 'income' },
    { id: 'pay1', date: '2024-07-27', description: 'Weekly Collection Service', amount: 120.00, type: 'payment' },
    { id: 'inc2', date: '2024-07-21', description: 'Sale of Aluminum Cans', amount: 150.00, type: 'income' },
    { id: 'pay2', date: '2024-07-20', description: 'Weekly Collection Service', amount: 110.00, type: 'payment' },
    { id: 'inc3', date: '2024-07-14', description: 'Sale of Cardboard', amount: 95.00, type: 'income' },
  ],
};

export const monthlyReportData: ReportData = {
  totalCosts: 1803.00,
  totalIncome: 2482.00,
  netResult: 679.00,
  chartData: [
    { name: 'April', costs: 480, income: 600 },
    { name: 'May', costs: 440, income: 720 },
    { name: 'June', costs: 500, income: 640 },
    { name: 'July', costs: 383, income: 522 },
  ],
  transactions: [
    { id: 'minc1', date: '2024-07-28', description: 'Sale of Mixed Recyclables', amount: 522.00, type: 'income' },
    { id: 'mpay1', date: '2024-07-27', description: 'Monthly Collection Service', amount: 383.00, type: 'payment' },
    { id: 'minc2', date: '2024-06-28', description: 'Sale of Mixed Recyclables', amount: 640.00, type: 'income' },
    { id: 'mpay2', date: '2024-06-27', description: 'Monthly Collection Service', amount: 500.00, type: 'payment' },
    { id: 'minc3', date: '2024-05-28', description: 'Sale of Mixed Recyclables', amount: 720.00, type: 'income' },
  ],
};
