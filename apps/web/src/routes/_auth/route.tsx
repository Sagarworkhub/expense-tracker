import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import Loader from '@/components/loader';
import { Layout } from '@/components/layout/index';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  if (session === null) {
    navigate({ to: '/sign-in' });
  }

  return <Layout />;
}
