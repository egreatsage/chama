import { redirect } from 'next/navigation';
import { getServerSideUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getServerSideUser();
  
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}