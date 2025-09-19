
// src/app/api/mercadopago/create-preference/route.ts

import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Mercado Pago is not configured." }, { status: 500 });
  }

  try {
    const client = new MercadoPagoConfig({
        accessToken: MERCADOPAGO_ACCESS_TOKEN,
    });
    const preference = new Preference(client);

    const { amount, description, userId, planType, userEmail } = await request.json();

    if (!amount || !description || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

    const preferenceData = {
      items: [
        {
          id: `${userId}-${planType}-${Date.now()}`,
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'COP', // Colombian Peso
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${baseUrl}/pricing`,
        failure: `${baseUrl}/pricing`,
        pending: `${baseUrl}/pricing`,
      },
      auto_return: 'approved' as 'approved',
      external_reference: userId,
    };

    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({ preferenceId: result.id });

  } catch (error: any) {
    console.error("Error creating Mercado Pago preference:", error);
    return NextResponse.json({ error: error.message || "Failed to create preference" }, { status: 500 });
  }
}
