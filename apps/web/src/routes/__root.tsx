import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Loader from '@/components/loader';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import type { trpc } from '@/utils/trpc';
import '../index.css';

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  return (
    <>
      <HeadContent />
      <ThemeProvider
        defaultTheme='light'
        storageKey='vite-ui-theme'
      >
        {isFetching ? <Loader /> : <Outlet />}
        <Toaster
          richColors
          position='top-right'
        />
      </ThemeProvider>
      <TanStackRouterDevtools position='bottom-left' />
      <ReactQueryDevtools
        position='bottom'
        buttonPosition='bottom-right'
      />
    </>
  );
}
