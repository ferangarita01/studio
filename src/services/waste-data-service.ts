import { wasteLog, materials, disposalEvents, weeklyReportData, monthlyReportData, wasteData } from "@/lib/data";
import type { WasteEntry, Material, DisposalEvent, ReportData } from "@/lib/types";

// This is a mock service. In a real application, you would fetch this data from a database.

export async function getWasteLog(): Promise<WasteEntry[]> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(wasteLog);
        }, 300);
    });
}

export async function getMaterials(): Promise<Material[]> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(materials);
        }, 300);
    });
}

export async function getDisposalEvents(): Promise<DisposalEvent[]> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(disposalEvents);
        }, 300);
    });
}

export async function getWeeklyReportData(): Promise<Record<string, ReportData>> {
    // Simulate async operation
     return new Promise((resolve) => {
        setTimeout(() => {
            resolve(weeklyReportData);
        }, 300);
    });
}

export async function getMonthlyReportData(): Promise<Record<string, ReportData>> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(monthlyReportData);
        }, 300);
    });
}

export async function getWasteChartData(): Promise<Record<string, any[]>> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(wasteData);
        }, 300);
    });
}
