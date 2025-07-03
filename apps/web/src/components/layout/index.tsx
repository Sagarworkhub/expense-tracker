import { Outlet } from '@tanstack/react-router';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';

export const Layout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='md:peer-data-[state=collapsed]:w-[calc(100svw-3rem)] md:peer-data-[state=expanded]:w-[calc(100svw-256px-15px)]'>
        <div className='flex flex-col'>
          {/* <SidebarTrigger /> */}
          <Header />
          <main className={cn('overflow-y-auto px-2 pt-8 md:px-10')}>
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
