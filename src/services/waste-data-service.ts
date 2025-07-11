import { wasteLog } from "@/lib/data";
import type { WasteEntry } from "@/lib/types";

// This is a mock service. In a real application, you would fetch this data from a database.
export async function getWasteLog(): Promise<WasteEntry[]> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(wasteLog);
        }, 500);
    });
}
