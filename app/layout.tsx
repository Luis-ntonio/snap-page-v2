import type { Metadata } from 'next';
import { Raleway, Gloock, Caveat } from 'next/font/google';
import './globals.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppFloat from './components/layout/WhatsAppFloat';
import Chatbot from './components/chatbot/Chatbot';
import { DemoProvider } from '@/lib/demo';
import { AuthProvider } from '@/lib/auth';
import DemoBanner from './components/layout/DemoBanner';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

const gloock = Gloock({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-hand',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Snap Page · Photobooks Personalizados',
  description: 'Transformamos tus fotos en fotolibros personalizados únicos. Desde S/.70',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${raleway.variable} ${gloock.variable} ${caveat.variable}`}>
      <body>
        <AuthProvider>
          <DemoProvider>
            <DemoBanner />
            <Navbar />
            {children}
            <Footer />
            <WhatsAppFloat />
            <Chatbot />
          </DemoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
