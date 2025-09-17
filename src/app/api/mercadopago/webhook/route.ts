
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, MerchantOrder } from 'mercadopago';
import { updateUserPlan, updateCompany } from '@/services/waste-data-service';

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("Mercado Pago access token is not configured.");
}

const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
const merchantOrder = new MerchantOrder(client);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Respond quickly to MercadoPago to avoid timeouts
    if (body.type === 'payment') {
      // Don't wait for the full processing, just acknowledge receipt.
      // The actual logic will run asynchronously.
      setTimeout(async () => {
        try {
          const paymentId = body.data.id;
          // In a real-world scenario, you should fetch the payment details from MercadoPago
          // to verify the payment status and amount before updating your database.
          // For this example, we'll trust the webhook and proceed with the merchant order.
          
          const paymentInfo = await merchantOrder.get({ merchantOrderId: paymentId });

          if (paymentInfo && paymentInfo.order_status === 'paid') {
            const userId = paymentInfo.external_reference;
            const items = paymentInfo.items;

            if (userId && items && items.length > 0) {
              const planType = items[0].title?.includes('Premium') ? 'Premium' : 'Free';
              
              // Set plan start and expiry dates
              const startDate = new Date();
              const expiryDate = new Date();
              expiryDate.setFullYear(startDate.getFullYear() + 1);

              // Update the user's plan
              await updateUserPlan(userId, planType);
              
              // Update the company associated with the user
              // Note: This logic assumes a user is tied to one company.
              // You might need a more complex lookup if a user can manage multiple companies.
              // For simplicity, we'll assume the external_reference is the companyId for now.
              await updateCompany(userId, { // Assuming userId is companyId for simplicity here
                 plan: planType,
                 planStartDate: startDate.toISOString(),
                 planExpiryDate: expiryDate.toISOString(),
              });
              
              console.log(`User ${userId} plan successfully updated to ${planType}.`);
            }
          }
        } catch (processingError) {
          console.error('Error processing MercadoPago webhook payment:', processingError);
        }
      }, 0);
    }
    
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Error handling MercadoPago webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
