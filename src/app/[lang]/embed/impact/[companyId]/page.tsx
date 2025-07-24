
import { getCompanyById, getWasteChartData } from "@/services/waste-data-service";
import { EmbeddableImpactPanelClient } from "./client-page";
import type { Locale } from "@/i18n-config";

export const revalidate = 60; // Revalidate the data every 60 seconds

async function getImpactData(companyId: string) {
    const company = await getCompanyById(companyId);
    if (!company) return null;

    const wasteData = await getWasteChartData();
    const companyWaste = wasteData[companyId] || [];

    const totalRecycling = companyWaste.reduce((acc, month) => acc + month.recycling, 0);
    const totalWaste = companyWaste.reduce((acc, month) => acc + month.recycling + month.organic + month.general, 0);
    
    const recyclingRate = totalWaste > 0 ? (totalRecycling / totalWaste) * 100 : 0;
    const carbonReduction = totalRecycling * 1; // 1kg CO2 reduction per 1kg recycled

    return {
        company,
        recyclingRate: recyclingRate.toFixed(1),
        carbonReduction: carbonReduction.toFixed(0),
    };
}


export default async function EmbeddableImpactPanel({ params }: { params: { companyId: string, lang: Locale } }) {
    const data = await getImpactData(params.companyId);

    if (!data) {
        return (
            <div className="flex h-full items-center justify-center bg-muted">
                <p className="text-muted-foreground">Company data not found.</p>
            </div>
        );
    }

    return <EmbeddableImpactPanelClient data={data} lang={params.lang} />;
}
