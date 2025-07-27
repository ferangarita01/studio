
"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { updateUserPlan } from "@/services/waste-data-service";

// In a real application, you would get this from your environment variables
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";

interface PayPalButtonProps {
    amount: string;
    description: string;
}

export function PayPalButtonWrapper({ amount, description }: PayPalButtonProps) {
    const { toast } = useToast();
    const { user, refreshUserProfile } = useAuth();

    if (!PAYPAL_CLIENT_ID) {
        console.error("PayPal Client ID is not set.");
        return <div className="text-red-500 text-center p-4">Could not load PayPal.</div>;
    }

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
            <div className="relative">
                <PayPalButtons
                    style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    description: description,
                                    amount: {
                                        value: amount,
                                    },
                                },
                            ],
                        });
                    }}
                    onApprove={(data, actions) => {
                         return actions.order!.capture().then(async (details) => {
                            if (user) {
                                await updateUserPlan(user.uid, 'Premium');
                                await refreshUserProfile(); // Refresh user profile to get the new plan
                                toast({
                                    title: "Payment Successful & Plan Upgraded!",
                                    description: `Thank you, ${details.payer.name?.given_name}! You are now on the Premium plan.`,
                                });
                            } else {
                                toast({
                                    title: "Payment Successful",
                                    description: `Thank you, ${details.payer.name?.given_name}! Your transaction is complete.`,
                                });
                            }
                        });
                    }}
                    onError={(err) => {
                        console.error("PayPal Checkout onError", err);
                        toast({
                            title: "Payment Error",
                            description: "Something went wrong with the payment. Please try again.",
                            variant: "destructive",
                        });
                    }}
                    onInit={(data, actions) => {
                        // You can disable the button until the SDK is ready
                    }}
                    disabled={false} // You can manage this state based on your form logic
                />
            </div>
        </PayPalScriptProvider>
    );
}
