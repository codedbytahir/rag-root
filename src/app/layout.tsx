import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RAG ROOT',
  description: 'Grounded Intelligence — The best RAG-powered chatbot platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-[#09090b] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
