import type { Metadata } from 'next';
import './globals.css';
import { AdminLayout } from '@/components/layout/AdminLayout';

export const metadata: Metadata = {
  title: 'BroHood Admin & Operations Command Center',
  description: 'Master operations dashboard for luxury watches, sneakers, designer goggles, and streetwear',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0b0e] text-zinc-100 antialiased selection:bg-[#e5c158]/30 selection:text-[#fbe294]">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
