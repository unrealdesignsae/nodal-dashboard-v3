import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nodal Technical Consultancy | EC26 Advancing Dashboard',
  description: 'Futuristic multi-tab advancing dashboard for EC26 Electric Castle Mainstage.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
