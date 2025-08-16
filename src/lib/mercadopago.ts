// src/lib/mercadopago.ts
import { initMercadoPago } from '@mercadopago/sdk-react';

// Inicializar MercadoPago con tu public key
initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!);

export default initMercadoPago;