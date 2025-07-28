
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM16.99 15.26c-.22-.11-.74-.36-1.1-0.42-.36-.06-.51.05-.66.3s-.42.66-.51.78c-.1.11-.2.13-.36.06-.16-.07-1.16-.42-2.2-1.36-.81-.72-1.36-1.62-1.5-1.9-.15-.28-.01-.43.1-.57.1-.11.22-.28.33-.42.11-.14.16-.25.22-.42.06-.16 0-.31-.03-.36-.03-.06-1.3-3.13-1.78-4.28-.45-1.08-.9-1.02-1.22-1.04h-.28c-.28 0-.66.11-.9.36s-1.1 1.07-1.1 2.6c0 1.53 1.13 3.01 1.28 3.21s2.21 3.54 5.35 4.72c.75.28 1.36.45 1.83.58.75.2 1.41.16 1.95.1.58-.06 1.1-.31 1.25-.6s.15-1.07.1-1.28c-.05-.22-.2-.33-.42-.44z" />
  </svg>
);


export function WhatsAppButton() {
  const phoneNumber = "573007561938"; // Reemplaza con tu número de teléfono
  const message = "Hola! Vengo desde WasteWise y necesito ayuda.";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      )}
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon className="h-7 w-7" fill="white" stroke="none" />
      <span className="sr-only">Contactar por WhatsApp</span>
    </Link>
  );
}
