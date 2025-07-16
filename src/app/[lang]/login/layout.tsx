import React from 'react';

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout previously was empty. We return children in a fragment.
  // The page itself will provide the background and centering.
  return <>{children}</>;
}
