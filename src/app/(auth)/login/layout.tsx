import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Login Admin - Posyandu Melati',
  description: 'Login ke dashboard admin Posyandu Melati',
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Completely override parent layout
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
