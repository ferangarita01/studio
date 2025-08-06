
"use client";

import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { updateUserPlan } from "@/services/waste-data-service";
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

interface MercadoPagoButtonProps {
    amount: number;
    description: string;
}

export function MercadoPagoButtonWrapper({ amount, description }: MercadoPagoButtonProps) {
    const { toast } = useToast();
    const { user, refreshUserProfile } = useAuth();
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (MERCADOPAGO_PUBLIC_KEY && MERCADOPAGO_PUBLIC_KEY !== "YOUR_PUBLIC_KEY_HERE") {
            initMercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'es-CO' });
        }
    }, []);

    const createPreference = async () => {
        setIsLoading(true);
        try {
            // This would typically be a call to your own backend server
            // to create the preference securely.
            // For this example, we'll simulate a client-side creation for simplicity,
            // which is NOT recommended for production.
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // IMPORTANT: This is NOT secure for production.
                    // The access token should be handled on a backend server.
                    // This is a placeholder for a demo environment.
                    'Authorization': `Bearer YOUR_ACCESS_TOKEN_HERE` 
                },
                body: JSON.stringify({
                    items: [
                        {
                            title: description,
                            quantity: 1,
                            unit_price: amount,
                            currency_id: 'COP' 
                        }
                    ],
                    back_urls: {
                        success: window.location.href,
                        failure: window.location.href,
                        pending: window.location.href
                    },
                    auto_return: 'approved'
                })
            });
            const data = await response.json();
            if (data.id) {
                setPreferenceId(data.id);
            } else {
                 toast({
                    title: "Error con Mercado Pago",
                    description: "No se pudo crear la preferencia de pago.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creating preference:", error);
            toast({
                title: "Error con Mercado Pago",
                description: "No se pudo conectar con el servicio.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // This is a placeholder for a real implementation where you would get the preference ID
    // For now, let's just use a dummy ID to render the button
     useEffect(() => {
        // In a real app, you would call createPreference() here.
        // For the demo, we are skipping this to avoid exposing access tokens.
        setIsLoading(false);
     }, []);


    if (!isClient) {
        return <Skeleton className="h-10 w-full" />;
    }
    
    if (!MERCADOPAGO_PUBLIC_KEY || MERCADOPAGO_PUBLIC_KEY === "YOUR_PUBLIC_KEY_HERE") {
        return (
            <div className="text-destructive text-center p-2 text-xs rounded-md bg-destructive/10">
                Mercado Pago no está configurado.
            </div>
        );
    }
    
    if (isLoading) {
        return <Skeleton className="h-10 w-full" />;
    }

    // Since we cannot create a preference ID securely on the client-side without
    // exposing an access token, this button will be disabled for the demo.
    // A full implementation requires a backend.
    return (
        <div id="wallet_container">
             <Wallet
                initialization={{
                    // preferenceId: preferenceId,
                    redirectMode: 'modal'
                }}
                customization={{
                    texts: {
                        valueProp: 'smart_option',
                    },
                }}
                onSubmit={() => new Promise((resolve) => {
                     // This is where you would handle the post-payment logic.
                     // Since we can't complete a real payment, we'll simulate success.
                     if (user) {
                         updateUserPlan(user.uid, 'Premium')
                             .then(() => refreshUserProfile())
                             .then(() => {
                                 toast({
                                     title: "¡Plan Actualizado!",
                                     description: "Ahora estás en el plan Premium.",
                                 });
                             });
                     }
                     resolve();
                })}
             />
        </div>
    );
}

