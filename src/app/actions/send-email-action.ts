// src/app/actions/send-email-action.ts
'use server';

import { getDatabase, ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { getUserProfile, getCompanyById } from "@/services/waste-data-service";
import nodemailer from 'nodemailer';

// --- Email Service (Real Implementation) ---

interface EmailPayload {
    to: string;
    from: string;
    subject: string;
    html: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.error("Resend API key is not set. Cannot send email.");
        throw new Error("Email service is not configured.");
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        secure: true,
        port: 465,
        auth: {
            user: 'resend',
            pass: RESEND_API_KEY,
        },
    });

    try {
        const info = await transporter.sendMail(payload);
        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Failed to send email via SMTP:", error);
        throw error;
    }
}

export async function sendCertificateByEmail(certificateId: string, companyId: string): Promise<void> {
    // 1. Get Company to find assigned user
    const company = await getCompanyById(companyId);
    if (!company || !company.assignedUserUid) {
        throw new Error("No user assigned to this company.");
    }

    // 2. Get User Profile to find email
    const userProfile = await getUserProfile(company.assignedUserUid);
    if (!userProfile || !userProfile.email) {
        throw new Error("Assigned user does not have an email address.");
    }

    // 3. Get Certificate details
    const certRef = ref(db, `disposalCertificates/${certificateId}`);
    const certSnapshot = await get(certRef);
    if (!certSnapshot.exists()) {
        throw new Error("Certificate not found.");
    }
    const certificate = certSnapshot.val();

    // 4. Construct and send the email
    const emailPayload: EmailPayload = {
        to: userProfile.email,
        from: "WasteWise <onboarding@resend.dev>", // IMPORTANT: Resend requires a verified domain. 'onboarding@resend.dev' is for testing.
        subject: `Tu Certificado de Disposición: ${certificate.fileName}`,
        html: `
            <h1>Certificado de Disposición Final</h1>
            <p>Hola ${userProfile.fullName || 'Usuario'},</p>
            <p>Adjunto encontrarás el certificado de disposición final que solicitaste:</p>
            <ul>
                <li><strong>Archivo:</strong> ${certificate.fileName}</li>
                <li><strong>Fecha de subida:</strong> ${new Date(certificate.uploadedAt).toLocaleDateString()}</li>
            </ul>
            <p><a href="${certificate.fileUrl}" target="_blank" rel="noopener noreferrer"><strong>Descargar Certificado</strong></a></p>
            <br/>
            <p>Gracias por usar WasteWise.</p>
        `,
    };

    await sendEmail(emailPayload);
}
