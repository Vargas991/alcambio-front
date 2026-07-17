import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}