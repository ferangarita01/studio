
"use client";

import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { type PlanType } from "@/lib/types";
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

interface MercadoPagoButtonProps {
    amount: number;
    description: string;
    planType?: PlanType;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function MercadoPagoButtonWrapper({ 
    amount, 
    description, 
    planType = 'Premium' as PlanType,
    onSuccess,
    onError 
}: MercadoPagoButtonProps) {
    const { toast } = useToast();
    const { user, refreshUserProfile } = useAuth();
    const router = useRouter();
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize MercadoPago SDK
    useEffect(() => {
        setIsClient(true);
        if (MERCADOPAGO_PUBLIC_KEY && MERCADOPAGO_PUBLIC_KEY !== "YOUR_PUBLIC_KEY_HERE") {
            try {
                initMercadoPago(MERCADOPAGO_PUBLIC_KEY, {
                    locale: 'es-CO'
                });
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to initialize Mercado Pago SDK:", error);
                setError("Error al inicializar MercadoPago");
            }
        } else {
            console.warn("Mercado Pago Public Key is not configured.");
        }
    }, []);
    
    // Check for payment status from URL (for one-time feedback)
    useEffect(() => {
      if (!isClient) return;

      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');

      if (status === 'approved') {
        toast({
            title: "¡Pago Exitoso!",
            description: `Tu plan ${planType} ha sido activado. Redirigiendo...`,
        });
        refreshUserProfile();
        setTimeout(() => router.push('/dashboard'), 2000);
      } else if (status === 'failure') {
         toast({
            title: "Pago Rechazado",
            description: "El pago no pudo ser procesado. Verifica tus datos e inténtalo nuevamente.",
            variant: "destructive",
        });
      }
      
      // Clean URL to avoid re-triggering
      if (status) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

    }, [isClient, refreshUserProfile, router, planType, toast]);


    // Create preference through your secure backend
    const createPreference = async () => {
        if (!user) {
            setError("Usuario no autenticado");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/mercadopago/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    description,
                    userId: user.uid,
                    planType,
                    userEmail: user.email || '',
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.preferenceId) {
                setPreferenceId(data.preferenceId);
            } else {
                throw new Error(data.error || "No se pudo crear la preferencia");
            }
        } catch (error) {
            console.error("Error creating preference:", error);
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            setError(errorMessage);
            onError?.(errorMessage);
            toast({
                title: "Error con Mercado Pago",
                description: "No se pudo inicializar el pago. Inténtalo nuevamente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    // Loading state
    if (!isClient || isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    // Error state
    if (error || !isInitialized) {
        return (
            <div className="flex items-center gap-2 text-destructive text-center p-4 text-sm rounded-md bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="font-medium">
                  {error || "MercadoPago no está disponible."}
                </p>
            </div>
        );
    }

    // Show create payment button if no preference yet
    if (!preferenceId) {
        return (
            <Button 
                onClick={createPreference}
                disabled={isLoading || !user}
                className="w-full h-12 text-base font-medium"
                size="lg"
            >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? "Inicializando pago..." : "Pagar con Mercado Pago"}
            </Button>
        );
    }

    // Render MercadoPago Wallet
    return (
        <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
                Completa tu pago de forma segura
            </div>
            <Wallet
                initialization={{ 
                    preferenceId: preferenceId,
                }}
                customization={{
                    theme: 'dark',
                    customStyle: {
                        borderRadius: '8px',
                    },
                }}
            />
        </div>
    );
}
