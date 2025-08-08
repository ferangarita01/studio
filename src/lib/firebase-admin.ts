
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { headers } from 'next/headers';

// This is a server-side only file.
// It is used to securely get the current user's session from a server component.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

const adminApp =
  getApps().find((app) => app.name === 'firebase-admin') ||
  initializeApp(
    {
      credential: serviceAccount ? cert(serviceAccount) : undefined,
    },
    'firebase-admin'
  );

const adminAuth = getAuth(adminApp);

export async function getCurrentUser(): Promise<UserRecord | null> {
  const authorization = headers().get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const user = await adminAuth.getUser(decodedToken.uid);
      return user;
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return null;
    }
  }
  return null;
}
