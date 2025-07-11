import type { ReactNode } from 'react';

// Este layout raíz simplemente renderiza a sus hijos.
// La lógica de redirección está en el middleware.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
