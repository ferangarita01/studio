
"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Recycle, Leaf } from "lucide-react";
import Image from 'next/image';
import type { Company } from "@/lib/types";
import { useParams } from "next/navigation";
import type { Locale } from "@/i18n-config";

interface ImpactData {
    company: Company;
    recyclingRate: string;
    carbonReduction: string;
}

interface EmbeddableImpactPanelClientProps {
    data: ImpactData;
}

export function EmbeddableImpactPanelClient({ data }: EmbeddableImpactPanelClientProps) {
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const params = useParams();
    const lang = params.lang as Locale;
    
    useEffect(() => {
        // Set the date only on the client-side to avoid hydration mismatch
        const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        setLastUpdated(new Date().toLocaleDateString(lang, dateOptions));
    }, [lang]);

    if (!data) return null;

    const { company, recyclingRate, carbonReduction } = data;

    return (
        <div className="p-6 bg-background font-sans max-w-2xl mx-auto">
            <header className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <Image 
                    src={company.logoUrl || 'https://placehold.co/100x100.png'} 
                    alt={`${company.name} Logo`}
                    width={80} 
                    height={80}
                    className="rounded-lg object-contain"
                    data-ai-hint="logo"
                />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                    <p className="text-md text-muted-foreground">{lang === 'es' ? 'Nuestro Compromiso con la Sostenibilidad' : 'Our Commitment to Sustainability'}</p>
                </div>
                <Badge variant="secondary" className="font-semibold">{lang === 'es' ? 'EN VIVO' : 'LIVE'}</Badge>
            </header>

            <Separator className="my-6" />

            <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-lg">
                            <Recycle className="h-5 w-5 text-primary" />
                            <span>{lang === 'es' ? 'Tasa de Reciclaje' : 'Recycling Rate'}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{recyclingRate}%</p>
                        <p className="text-xs text-muted-foreground">{lang === 'es' ? 'del total de residuos generados' : 'of total waste generated'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-lg">
                            <Leaf className="h-5 w-5 text-green-600" />
                            <span>{lang === 'es' ? 'Reducción de CO₂' : 'CO₂ Reduction'}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-green-600">{carbonReduction} kg</p>
                        <p className="text-xs text-muted-foreground">{lang === 'es' ? 'de emisiones de CO₂ evitadas' : 'of CO₂ emissions avoided'}</p>
                    </CardContent>
                </Card>
            </main>

            <footer className="mt-6 text-center text-xs text-muted-foreground">
                <p>{lang === 'es' ? 'Datos proporcionados por' : 'Data provided by'} <span className="font-bold text-primary">WasteWise</span></p>
                <p>
                    {lastUpdated 
                        ? (lang === 'es' ? `Actualizado por última vez: ${lastUpdated}` : `Last updated: ${lastUpdated}`)
                        : (lang === 'es' ? 'Cargando fecha...' : 'Loading date...')
                    }
                </p>
            </footer>
        </div>
    );
}
