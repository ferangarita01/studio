
"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Recycle, Leaf } from "lucide-react";
import Image from 'next/image';
import type { Company } from "@/lib/types";

interface ImpactData {
    company: Company;
    recyclingRate: string;
    carbonReduction: string;
}

interface EmbeddableImpactPanelClientProps {
    data: ImpactData;
}

export function EmbeddableImpactPanelClient({ data }: EmbeddableImpactPanelClientProps) {
    const [lastUpdated, setLastUpdated] = useState("");
    
    useEffect(() => {
        // Set the date only on the client-side to avoid hydration mismatch
        setLastUpdated(new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
    }, []);

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
                    <p className="text-md text-muted-foreground">Nuestro Compromiso con la Sostenibilidad</p>
                </div>
                <Badge variant="secondary" className="font-semibold">EN VIVO</Badge>
            </header>

            <Separator className="my-6" />

            <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-lg">
                            <Recycle className="h-5 w-5 text-primary" />
                            <span>Tasa de Reciclaje</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{recyclingRate}%</p>
                        <p className="text-xs text-muted-foreground">del total de residuos generados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-lg">
                            <Leaf className="h-5 w-5 text-green-600" />
                            <span>Reducción de CO₂</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-green-600">{carbonReduction} kg</p>
                        <p className="text-xs text-muted-foreground">de emisiones de CO₂ evitadas</p>
                    </CardContent>
                </Card>
            </main>

            <footer className="mt-6 text-center text-xs text-muted-foreground">
                <p>Datos proporcionados por <span className="font-bold text-primary">WasteWise</span></p>
                {lastUpdated && <p>Actualizado por última vez: {lastUpdated}</p>}
            </footer>
        </div>
    );
}
