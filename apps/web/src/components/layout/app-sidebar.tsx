import { CreditCard, Home, List, LogOut, CheckSquare } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, useLocation } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Loader from '@/components/loader';
import { queryClient } from '@/utils/trpc';

const userMenuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'All Expenses',
    url: '/all-expenses',
    icon: List,
  },
];

const adminMenuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'All Expenses',
    url: '/all-expenses',
    icon: List,
  },
  {
    title: 'Approval Queue',
    url: '/admin/approve-expenses',
    icon: CheckSquare,
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { data: session, isPending } = authClient.useSession();

  const menuItems =
    session?.user?.role === 'admin' ? adminMenuItems : userMenuItems;

  const logout = () => {
    // Invalidate all queries before signing out
    queryClient.removeQueries();
    authClient.signOut();
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <Sidebar className='bg-secondary'>
      <SidebarHeader className='border-b'>
        <div className='flex items-center gap-2 px-2 py-2'>
          <CreditCard className='h-6 w-6' />
          <span className='font-semibold'>Expense Manager</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className='my-0.5 py-4 data-[active=true]:bg-primary data-[active=true]:text-accent'
                    variant='outline'
                  >
                    <Link to={item.url}>
                      <item.icon className='h-4 w-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className='w-full'>
                  <Avatar className='h-6 w-6'>
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>
                      {session?.user?.name
                        ?.split(' ')
                        .map((n) => n[0].toUpperCase())
                        .join('') ||
                        session?.user?.email
                          ?.split('@')[0]
                          ?.charAt(0)
                          .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col items-start text-sm'>
                    <span className='font-medium'>
                      {session?.user?.name || session?.user?.email}
                    </span>
                    <span className='text-xs text-muted-foreground capitalize'>
                      {session?.user?.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side='top'
                className='w-[--radix-popper-anchor-width]'
              >
                <DropdownMenuItem onClick={logout}>
                  <LogOut className='h-4 w-4 mr-2' />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
