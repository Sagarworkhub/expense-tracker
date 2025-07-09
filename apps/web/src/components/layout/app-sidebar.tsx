import {
  CreditCard,
  Home,
  List,
  LogOut,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';
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
import { Badge } from '../ui/badge';

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

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0].toUpperCase())
        .join('');
    }
    if (email) {
      return email.split('@')[0]?.charAt(0).toUpperCase() || 'U';
    }
    return 'U';
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <Sidebar className='bg-card border-r border-border'>
      <SidebarHeader className='border-b border-border bg-card/50 backdrop-blur-sm'>
        <div className='flex items-center gap-3 px-4 py-4'>
          <div className='size-8 bg-gradient-to-r from-emerald-primary to-emerald-secondary rounded-lg flex items-center justify-center shadow-lg'>
            <CreditCard className='size-4 text-emerald-primary-foreground' />
          </div>
          <div className='flex flex-col'>
            <span className='font-bold text-card-foreground text-lg'>
              Expense Manager
            </span>
            <span className='text-xs text-muted-foreground'>
              Track your spending
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className='mt-2'>
            <SidebarMenu className='space-y-1'>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className='group relative mx-2 rounded-lg transition-all duration-200 hover:bg-accent/50 data-[active=true]:bg-emerald-primary/10 data-[active=true]:text-emerald-primary data-[active=true]:border-emerald-primary/20 data-[active=true]:shadow-sm'
                  >
                    <Link
                      to={item.url}
                      className='flex items-center gap-3 px-3 py-2.5 w-full'
                    >
                      <item.icon className='size-4 transition-colors group-hover:text-emerald-accent' />
                      <span className='font-medium'>{item.title}</span>
                      {pathname === item.url && (
                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-primary rounded-r-full' />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-border bg-card/50 backdrop-blur-sm'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className='w-full p-3 hover:bg-accent/50 transition-colors duration-200 group'>
                  <div className='flex items-center gap-3 w-full'>
                    <Avatar className='size-8 ring-2 ring-emerald-primary/20'>
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className='bg-emerald-primary text-emerald-primary-foreground text-sm font-semibold'>
                        {getUserInitials(
                          session?.user?.name,
                          session?.user?.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col items-start text-sm min-w-0 flex-1'>
                      <span className='font-medium text-card-foreground truncate w-full'>
                        {session?.user?.name || session?.user?.email}
                      </span>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-muted-foreground capitalize'>
                          {session?.user?.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                        {session?.user?.role === 'admin' && (
                          <Badge
                            variant='secondary'
                            className='h-4 px-1.5 text-xs'
                          >
                            Pro
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronDown className='size-4 text-muted-foreground group-hover:text-card-foreground transition-colors' />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side='top'
                className='w-[--radix-popper-anchor-width] bg-popover border-border shadow-lg'
              >
                <DropdownMenuItem
                  onClick={logout}
                  className='flex items-center gap-2 cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive'
                >
                  <LogOut className='size-4' />
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
