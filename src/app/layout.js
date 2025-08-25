// app/layout.jsx
import { Roboto } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import Header from '@/components/navigation/Header';
import { Toaster } from 'react-hot-toast';

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['400', '500', '700']
 });

export const metadata = {
  title: 'Chama',
  description: 'Chama app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Toaster position='center-top' />  
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