// app/layout.jsx
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import Header from '@/components/navigation/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chama',
  description: 'Chama app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}