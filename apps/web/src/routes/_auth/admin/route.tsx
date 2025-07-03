import { authClient } from '@/lib/auth-client';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/admin')({
  component: Outlet,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session?.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
});
