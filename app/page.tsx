import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard';
import { WelcomeHero } from '@/components/welcome-hero';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero />
        <Suspense fallback={<div>Caricamento...</div>}>
          <Dashboard />
        </Suspense>
      </div>
    </main>
  );
}
