
import type { Locale } from '@/i18n-config';

export type WasteType = "Recycling" | "Organic" | "General" | "Hazardous";
export type PlanType = "Free" | "Premium" | "Custom";
export type AccountType = "individual" | "company";

export interface WasteEntry {
  id: string;
  companyId: string;
  type: WasteType;
  materialId: string;
  materialName: string;
  quantity: number;
  date: Date;
  price?: number;
  serviceCost?: number;
  createdBy: string;
}

export interface Material {
  id: string;
  name: string;
  type: WasteType;
  pricePerKg: number;
  serviceCostPerKg: number;
}

export interface DisposalEvent {
  id: string;
  companyId: string;
  date: Date;
  wasteTypes: WasteType[];
  status: "Scheduled" | "Ongoing" | "Completed" | "Cancelled";
  instructions: string;
}

export interface DisposalCertificate {
    id: string;
    companyId: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    uploadedBy: string;
}

export interface ReportData {
  companyId: string;
  totalCosts: number;
  totalIncome: number;
  netResult: number;
  chartData: { name: string; costs: number; income: number }[];
  transactions: {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: "income" | "payment";
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  role: "admin" | "client";
  fullName: string;
  assignedCompanyId?: string;
  assignedCompany?: {
    id: string;
    name: string;
    logoUrl?: string;
    coverImageUrl?: string;
  };
  plan: PlanType;
  // New onboarding fields
  accountType?: AccountType;
  companyName?: string;
  taxId?: string;
  idNumber?: string;
  // Optional profile fields
  phone?: string;
  jobTitle?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface Company {
  id: string;
  name: string;
  createdBy: string;
  assignedUserUid?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  plan: PlanType;
  planStartDate?: string;
  planExpiryDate?: string;
}

export interface EmissionFactor {
  id: string;
  category: string;
  subcategory: string;
  factor: number;
  unit: string;
  source: string;
  region: string;
  scope?: number;
}

export interface ValorizedResidue {
  id: string;
  userId: string;
  date: Date;
  type: string;
  quantity: number;
  unit: string;
  emissionsAvoided: number;
}

// Correct PageProps for Next.js App Router
export type PageProps<T extends Record<string, string> = {}> = {
  params: { lang: Locale } & T;
  searchParams?: { [key: string]: string | string[] | undefined };
};
