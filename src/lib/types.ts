export type WasteType = "Recycling" | "Organic" | "General" | "Hazardous";

export type Company = {
  id: string;
  name: string;
};

export type WasteEntry = {
  id: string;
  companyId: string;
  date: Date;
  type: WasteType;
  quantity: number; // in kg
  price?: number; // price per kg, for recyclables
  serviceCost?: number; // cost for disposal service
  notes?: string;
};

export type Attachment = {
  id: string;
  name: string;
  type: "image" | "pdf" | "audio";
  url: string;
};

export type DisposalEvent = {
  id: string;
  companyId: string;
  date: Date;
  wasteTypes: WasteType[];
  status: "Scheduled" | "Completed" | "Cancelled" | "Ongoing";
  instructions?: string;
  attachments?: Attachment[];
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
  companyId: string;
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
