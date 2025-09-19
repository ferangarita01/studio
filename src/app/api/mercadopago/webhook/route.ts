
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, MerchantOrder } from 'mercadopago';
import { updateUserPlan, updateCompany } from '@/services/waste-data-service';


export async function POST(request: NextRequest) {
  const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Mercado Pago is not configured." }, { status: 500 });
  }
  
  const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
  const merchantOrder = new MerchantOrder(client);
  
  try {
    const body = await request.json();
    
    if (body.type === 'payment') {
      setTimeout(async () => {
        try {
          const paymentId = body.data.id;
          const paymentInfo = await merchantOrder.get({ merchantOrderId: paymentId });

          if (paymentInfo && paymentInfo.order_status === 'paid') {
            const userId = paymentInfo.external_reference;
            const items = paymentInfo.items;

            if (userId && items && items.length > 0) {
              const planType = items[0].title?.includes('Premium') ? 'Premium' : 'Free';
              
              const startDate = new Date();
              const expiryDate = new Date();
              expiryDate.setFullYear(startDate.getFullYear() + 1);

              await updateUserPlan(userId, planType);
              
              await updateCompany(userId, { 
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
