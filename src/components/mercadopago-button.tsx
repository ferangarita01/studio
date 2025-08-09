
"use client"; // This is a client component 

import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { updateUserPlan } from "@/services/waste-data-service";
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "";
// IMPORTANT: This is a TEST access token for the sandbox environment.
// Replace with a secure backend call for production.
const MERCADOPAGO_TEST_ACCESS_TOKEN = "TEST-8514800378495098-073117-91a54776110f03225674c10702672522-1943640243";

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

    // State to hold the Mercado Pago SDK instance
    const [mp, setMp] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
        if (MERCADOPAGO_PUBLIC_KEY && MERCADOPAGO_PUBLIC_KEY !== "YOUR_PUBLIC_KEY_HERE") {
            try {
                const mpInstance = new (window as any).MercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'es-CO' });
                setMp(mpInstance);
            } catch (error) {
                console.error("Failed to initialize Mercado Pago SDK:", error);
            }
        }
        // Ensure the script is loaded
        // The script tag is likely in your _document.js or layout.tsx
    }, []);

    const createPreference = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // This would typically be a call to your own backend server
            // to create the preference securely.
            // For this example, we are using a TEST access token on the client-side
            // for demonstration purposes in a sandbox environment.
            // DO NOT use a production access token here.
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MERCADOPAGO_TEST_ACCESS_TOKEN}`
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
                        success: window.location.href.split('?')[0] + '?mp_status=success',
                        failure: window.location.href.split('?')[0] + '?mp_status=failure',
                        pending: window.location.href.split('?')[0] + '?mp_status=pending'
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
    
    // Create preference when component is client-side and user is available
    useEffect(() => {
        if (isClient && user) {
            createPreference();
        }
    }, [isClient, user]);

    // Render the Wallet brick when preferenceId and SDK are ready
    useEffect(() => {
        if (preferenceId && mp) {
            const bricksBuilder = mp.bricks();
            bricksBuilder.create('wallet', 'walletBrick_container', {
                initialization: { preferenceId: preferenceId },
            });
        }
    }, [isClient, user]);

    // Handle payment status feedback from redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('mp_status');
        if (status === 'success' && user) {
            updateUserPlan(user.uid, 'Premium').then(() => {
                // Refresh user profile to reflect the plan change
                refreshUserProfile();
                 toast({
                    title: "Pago Exitoso y Plan Actualizado!",
                    description: `¡Gracias! Ahora tienes el plan Premium.`,
                });
            });
        } else if (status === 'failure') {
             toast({
                title: "Pago Fallido",
                description: "El pago no pudo ser procesado. Por favor, inténtalo de nuevo.",
                variant: "destructive",
            });
        }
    }, [user]);


    if (!isClient) {
        return <Skeleton className="h-10 w-full" />;
    }
    
    if (!MERCADOPAGO_PUBLIC_KEY || MERCADOPAGO_PUBLIC_KEY === "YOUR_PUBLIC_KEY_HERE" || !MERCADOPAGO_TEST_ACCESS_TOKEN) {
        return (
            <div className="text-destructive text-center p-2 text-xs rounded-md bg-destructive/10">
                Mercado Pago no está configurado.
            </div>
        );
    }
    
    if (isLoading) {
        return <Skeleton className="h-10 w-full" />;
    }

    if (!preferenceId) {
         return (
            <div className="text-destructive text-center p-2 text-xs rounded-md bg-destructive/10">
                Error al inicializar el pago.
            </div>
        );
    }
    
    return (
        <div id="walletBrick_container">
        </div>
    );
}