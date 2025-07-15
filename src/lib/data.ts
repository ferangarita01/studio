import type { WasteEntry, DisposalEvent, ReportData, Company, Material } from "./types";

export const companies: Company[] = [
  { id: "c1", name: "Innovate Inc." },
  { id: "c2", name: "EcoSolutions" },
];

export const materials: Material[] = [
  { id: "m1", name: "Plastic Bottles (PET)", type: "Recycling", pricePerKg: 0.55 },
  { id: "m2", name: "Cardboard", type: "Recycling", pricePerKg: 0.30 },
  { id: "m3", name: "Aluminum Cans", type: "Recycling", pricePerKg: 1.20 },
  { id: "m4", name: "Glass", type: "Recycling", pricePerKg: 0.15 },
  { id: "m5", name: "Food Scraps", type: "Organic", pricePerKg: 0 },
  { id: "m6", name: "Office Paper", type: "Recycling", pricePerKg: 0.40 },
  { id: "m7", name: "Mixed Municipal Waste", type: "General", pricePerKg: 0 },
  { id: "m8", name: "Used Batteries", type: "Hazardous", pricePerKg: 0 },
];


export const wasteLog: WasteEntry[] = [
  { id: "1", companyId: "c1", date: new Date("2024-05-20"), type: "Recycling", quantity: 15.5, price: 0.5, serviceCost: 5.0 },
  { id: "2", companyId: "c1", date: new Date("2024-05-20"), type: "Organic", quantity: 30.2, serviceCost: 10.0 },
  { id: "3", companyId: "c1", date: new Date("2024-05-19"), type: "General", quantity: 55.0, serviceCost: 25.0 },
  { id: "4", companyId: "c1", date: new Date("2024-05-18"), type: "Recycling", quantity: 22.1, price: 0.55, serviceCost: 5.0 },
  { id: "5", companyId: "c1", date: new Date("2024-05-17"), type: "Hazardous", quantity: 2.5, serviceCost: 50.0 },
  { id: "6", companyId: "c1", date: new Date("2024-05-16"), type: "Organic", quantity: 28.0, serviceCost: 10.0 },
  { id: "7", companyId: "c2", date: new Date("2024-05-20"), type: "Recycling", quantity: 45.0, price: 0.6, serviceCost: 15.0 },
  { id: "8", companyId: "c2", date: new Date("2024-05-19"), type: "General", quantity: 105.0, serviceCost: 40.0 },
  { id: "9", companyId: "c2", date: new Date("2024-05-18"), type: "Organic", quantity: 80.0, serviceCost: 30.0 },
];

export const disposalEvents: DisposalEvent[] = [
  {
    id: "disp-prev-1",
    companyId: "c1",
    date: new Date(new Date().setDate(new Date().getDate() - 15)),
    wasteTypes: ["General", "Recycling"],
    status: "Completed",
    instructions: "Standard collection. No issues reported.",
    attachments: [
      { id: 'att1', name: 'Delivery_Act_01.pdf', type: 'pdf', url: '#' },
      { id: 'att2', name: 'Collection_Photo_1.jpg', type: 'image', url: 'https://placehold.co/600x400.png' },
    ],
  },
  {
    id: "disp-ongoing-1",
    companyId: "c1",
    date: new Date(),
    wasteTypes: ["Organic"],
    status: "Ongoing",
    instructions: "Driver is on the way. Expected arrival in 1 hour.",
  },
  {
    id: "disp-upcoming-1",
    companyId: "c1",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    wasteTypes: ["General", "Recycling"],
    status: "Scheduled",
    instructions: "Please ensure the gate is unlocked by 8 AM. Call John on arrival.",
  },
    {
    id: "disp-upcoming-2-c2",
    companyId: "c2",
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    wasteTypes: ["Hazardous"],
    status: "Scheduled",
    instructions: "Special collection for EcoSolutions. Follow protocol.",
  },
  {
    id: "disp-upcoming-2",
    companyId: "c1",
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    wasteTypes: ["Organic"],
    status: "Scheduled",
  },
  {
    id: "disp-upcoming-3",
    companyId: "c1",
    date: new Date(new Date().setDate(new Date().getDate() + 14)),
    wasteTypes: ["Hazardous"],
    status: "Scheduled",
    instructions: "Special handling required. Please use provided containers.",
    attachments: [
      { id: 'att3', name: 'Safety_Protocol.pdf', type: 'pdf', url: '#' },
    ],
  },
  {
    id: "disp-cancelled-1",
    companyId: "c1",
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    wasteTypes: ["General"],
    status: "Cancelled",
    instructions: "Cancelled due to holiday.",
  },
];


export const wasteData = {
  c1: [
    { month: "January", recycling: 186, organic: 80, general: 240 },
    { month: "February", recycling: 305, organic: 200, general: 280 },
    { month: "March", recycling: 237, organic: 120, general: 320 },
    { month: "April", recycling: 273, organic: 190, general: 310 },
    { month: "May", recycling: 209, organic: 130, general: 290 },
    { month: "June", recycling: 214, organic: 140, general: 330 },
  ],
  c2: [
    { month: "January", recycling: 450, organic: 210, general: 300 },
    { month: "February", recycling: 480, organic: 250, general: 320 },
    { month: "March", recycling: 510, organic: 220, general: 310 },
    { month: "April", recycling: 490, organic: 230, general: 330 },
    { month: "May", recycling: 530, organic: 260, general: 350 },
    { month: "June", recycling: 550, organic: 280, general: 340 },
  ]
};

export const weeklyReportData: Record<string, ReportData> = {
  c1: {
    companyId: 'c1',
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
  },
  c2: {
    companyId: 'c2',
    totalCosts: 850.00,
    totalIncome: 1100.00,
    netResult: 250.00,
    chartData: [
      { name: 'Week 1', costs: 220, income: 280 },
      { name: 'Week 2', costs: 210, income: 300 },
      { name: 'Week 3', costs: 225, income: 270 },
      { name: 'Week 4', costs: 195, income: 250 },
    ],
    transactions: [
      { id: 'c2-inc1', date: '2024-07-28', description: 'Sale of Glass', amount: 150.00, type: 'income' },
      { id: 'c2-pay1', date: '2024-07-27', description: 'Weekly Heavy Duty Collection', amount: 220.00, type: 'payment' },
    ],
  }
};

export const monthlyReportData: Record<string, ReportData> = {
  c1: {
    companyId: 'c1',
    totalCosts: 1803.00,
    totalIncome: 2482.00,
    netResult: 679.00,
    chartData: [
      { name: 'Apr', costs: 480, income: 600 },
      { name: 'May', costs: 440, income: 720 },
      { name: 'Jun', costs: 500, income: 640 },
      { name: 'Jul', costs: 383, income: 522 },
    ],
    transactions: [
      { id: 'minc1', date: '2024-07-28', description: 'Sale of Mixed Recyclables', amount: 522.00, type: 'income' },
      { id: 'mpay1', date: '2024-07-27', description: 'Monthly Collection Service', amount: 383.00, type: 'payment' },
      { id: 'minc2', date: '2024-06-28', description: 'Sale of Mixed Recyclables', amount: 640.00, type: 'income' },
      { id: 'mpay2', date: '2024-06-27', description: 'Monthly Collection Service', amount: 500.00, type: 'payment' },
      { id: 'minc3', date: '2024-05-28', description: 'Sale of Mixed Recyclables', amount: 720.00, type: 'income' },
    ],
  },
  c2: {
    companyId: 'c2',
    totalCosts: 3400.00,
    totalIncome: 4200.00,
    netResult: 800.00,
    chartData: [
      { name: 'Apr', costs: 880, income: 1000 },
      { name: 'May', costs: 840, income: 1120 },
      { name: 'Jun', costs: 900, income: 1040 },
      { name: 'Jul', costs: 780, income: 1042 },
    ],
    transactions: [
      { id: 'c2-minc1', date: '2024-07-28', description: 'Monthly Bulk Sale', amount: 1042.00, type: 'income' },
      { id: 'c2-mpay1', date: '2024-07-27', description: 'Monthly Industrial Collection', amount: 780.00, type: 'payment' },
    ],
  }
};
