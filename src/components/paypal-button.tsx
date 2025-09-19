
"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { updateUserPlan } from "@/services/waste-data-service";

// Make sure to set your PayPal client ID in the .env file
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";

interface PayPalButtonProps {
    amount: string;
    description: string;
}

export function PayPalButtonWrapper({ amount, description }: PayPalButtonProps) {
    const { toast } = useToast();
    const { user, refreshUserProfile } = useAuth();

    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === "test") {
        console.error("PayPal Client ID is not set in .env file.");
        return <div className="text-destructive text-center p-4 text-sm">Could not load PayPal. Please contact support.</div>;
    }

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "COP", intent: "capture" }}>
            <div className="relative">
                <PayPalButtons
                    style={{ layout: "horizontal", color: "blue", shape: "rect", label: "pay", tagline: false }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    description: description,
                                    amount: {
                                        currency_code: "COP",
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
                                    description: `Thank you, ${details.payer?.name?.given_name}! You are now on the Premium plan.`,
                                });
                            } else {
                                toast({
                                    title: "Payment Successful",
                                    description: `Thank you, ${details.payer?.name?.given_name}! Your transaction is complete.`,
                                });
                            }
                        });
                    }}
                    onCancel={(data) => {
                        console.log("PayPal payment cancelled:", data);
                        toast({
                            title: "Payment Cancelled",
                            description: "You have cancelled the payment process. Please try again when you're ready.",
                            variant: "default",
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
