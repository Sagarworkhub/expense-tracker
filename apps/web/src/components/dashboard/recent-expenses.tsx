import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export const RecentExpenses = () => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    ...trpc.expense.getAll.queryOptions({
      sortBy: 'date',
      sortDirection: 'asc',
      limit: 5,
    }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
    gcTime: 1000 * 60 * 30,
  });

  const expenses = response?.data || [];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getUserInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  return (
    <Card className='bg-card border-border hover:border-emerald-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20'>
      <CardHeader className='[.border-b]:pb-2 border-b border-border/50'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-10 bg-gradient-to-b from-emerald-primary to-emerald-secondary rounded-full' />
          <div>
            <CardTitle className='text-lg font-semibold text-card-foreground'>
              Recent Expenses
            </CardTitle>
            <CardDescription className='text-muted-foreground mt-1'>
              Your latest expense submissions
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center justify-between space-x-4 p-3 rounded-lg bg-muted/20 animate-pulse'
              >
                <div className='flex items-center space-x-4'>
                  <Skeleton className='h-10 w-10 rounded-full bg-muted/50' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-32 bg-muted/50' />
                    <Skeleton className='h-3 w-24 bg-muted/30' />
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <Skeleton className='h-4 w-16 bg-muted/50' />
                  <Skeleton className='h-6 w-16 rounded-full bg-muted/30' />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='py-8 text-center'>
            <p className='text-destructive font-medium'>
              Failed to load recent expenses
            </p>
            <p className='text-muted-foreground text-sm mt-1'>
              Please try again later
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground font-medium'>
              No expenses found
            </p>
            <p className='text-muted-foreground text-sm mt-1'>
              Start by adding your first expense
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {expenses.map((expense, index) => (
              <div
                key={expense.id}
                className='group flex items-center justify-between space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-emerald-primary/20'
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className='flex items-center space-x-4 min-w-0 flex-1'>
                  <Avatar className='size-10 ring-2 ring-emerald-primary/20 group-hover:ring-emerald-primary/40 transition-all duration-200'>
                    <AvatarFallback className='text-xs font-semibold bg-emerald-primary/10 text-emerald-primary group-hover:bg-emerald-primary/20'>
                      {getUserInitials(expense.userId)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='space-y-1 min-w-0 flex-1'>
                    <p className='text-sm font-medium leading-none text-card-foreground group-hover:text-emerald-primary transition-colors duration-200 truncate'>
                      {expense.description}
                    </p>
                    <p className='text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200'>
                      <span className='font-medium'>{expense.category}</span> •{' '}
                      {formatDate(expense.date.toString())}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 flex-shrink-0'>
                  <div className='text-sm font-semibold text-emerald-primary group-hover:text-emerald-secondary transition-colors duration-200'>
                    ${Number(expense.amount).toFixed(2)}
                  </div>
                  <Badge
                    variant={getStatusVariant(expense.status)}
                    className='text-xs font-medium group-hover:scale-105 transition-transform duration-200'
                  >
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
