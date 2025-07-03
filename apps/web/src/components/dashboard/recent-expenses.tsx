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
  // Fetch recent expenses
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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get status badge variant
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

  // Get user initials for avatar
  const getUserInitials = (userId: string) => {
    // In a real app, you might want to fetch user details
    // For now, just use the first two characters of the userId
    return userId.substring(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Your latest expense submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='flex items-center justify-between space-x-4'
              >
                <div className='flex items-center space-x-4'>
                  <Skeleton className='h-8 w-8 rounded-full' />
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-5 w-16 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='py-4 text-center text-destructive'>
            Failed to load recent expenses
          </div>
        ) : expenses.length === 0 ? (
          <div className='py-4 text-center text-muted-foreground'>
            No expenses found
          </div>
        ) : (
          <div className='space-y-4'>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className='flex items-center justify-between space-x-4'
              >
                <div className='flex items-center space-x-4'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='text-xs'>
                      {getUserInitials(expense.userId)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {expense.description}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {expense.category} • {formatDate(expense.date.toString())}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='text-sm font-medium'>
                    ${Number(expense.amount).toFixed(2)}
                  </div>
                  <Badge
                    variant={getStatusVariant(expense.status)}
                    className='text-xs'
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
