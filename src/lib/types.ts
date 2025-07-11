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

export type TransactionType = "payment" | "income";

export type FinancialTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
};

export type ReportData = {
  totalCosts: number;
  totalIncome: number;
  netResult: number;
  chartData: {
    name: string;
    costs: number;
    income: number;
  }[];
  transactions: FinancialTransaction[];
};
