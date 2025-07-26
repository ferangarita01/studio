
export type WasteType = "Recycling" | "Organic" | "General" | "Hazardous";
export type UserRole = "admin" | "client";

export type UserProfile = {
  id: string; // Firebase UID
  email: string;
  role: UserRole;
  assignedCompanyId?: string;
}

export type Company = {
  id: string;
  name: string;
  createdBy: string; // UID of the admin user who created it
  assignedUserUid?: string; // UID of the client user assigned to this company
  assignedUserName?: string; // email of the assigned user, for display
  logoUrl?: string; // URL for the company's logo, for embeddable modules
  coverImageUrl?: string; // URL for the company's cover/hero image
};

export type Material = {
  id: string;
  name: string;
  type: WasteType;
  pricePerKg: number; // price per kg, for recyclables
};

export type WasteEntry = {
  id:string;
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
