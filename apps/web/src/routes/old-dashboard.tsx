import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/old-dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const { data: userRole } = useQuery({
    ...trpc.user.getRole.queryOptions(),
    enabled: !!session,
  });

  const [groupBy, setGroupBy] = useState<
    'category' | 'status' | 'day' | 'month' | 'year' | 'user'
  >('category');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Redirect non-admin users
  useEffect(() => {
    if (session === null) {
      navigate({ to: '/login', search: { redirect: '/dashboard' } });
    } else if (userRole && userRole !== 'admin') {
      navigate({ to: '/expenses' });
    }
  }, [session, userRole, navigate]);

  const analytics = useQuery({
    ...trpc.expense.getTeamAnalytics.queryOptions({
      groupBy,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    }),
    enabled: !!session && userRole === 'admin',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return '';
    }
  };

  const getTotalAmount = () => {
    if (!analytics.data) return 0;
    return analytics.data.reduce((sum, item) => sum + Number(item.total), 0);
  };

  const getGroupLabel = () => {
    switch (groupBy) {
      case 'category':
        return 'Category';
      case 'status':
        return 'Status';
      case 'day':
        return 'Day';
      case 'month':
        return 'Month';
      case 'year':
        return 'Year';
      case 'user':
        return 'Employee';
      default:
        return 'Group';
    }
  };

  // If not admin or not logged in, show loading
  if (!session || !userRole || userRole !== 'admin') {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-4xl py-10'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Users className='h-6 w-6' />
            <div>
              <CardTitle>Team Expense Analytics</CardTitle>
              <CardDescription>
                Analyze expense patterns across your team
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                >
                  Group by: {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setGroupBy('category')}>
                  Category
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('status')}>
                  Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('user')}>
                  Employee
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('day')}>
                  Day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('month')}>
                  Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('year')}>
                  Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='startDate'>Start Date</Label>
              <Input
                id='startDate'
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='endDate'>End Date</Label>
              <Input
                id='endDate'
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {analytics.isLoading ? (
            <div className='flex justify-center py-4'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : analytics.data?.length === 0 ? (
            <p className='py-4 text-center'>
              No expense data available for the selected filters.
            </p>
          ) : (
            <>
              <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {formatCurrency(getTotalAmount())}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Number of Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {analytics.data?.reduce(
                        (sum, item) => sum + Number(item.count),
                        0
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Average Expense
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {formatCurrency(
                        getTotalAmount() /
                          (analytics.data?.reduce(
                            (sum, item) => sum + Number(item.count),
                            0
                          ) || 1)
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='pb-2 text-left'>{getGroupLabel()}</th>
                      <th className='pb-2 text-right'>Count</th>
                      <th className='pb-2 text-right'>Total Amount</th>
                      <th className='pb-2 text-right'>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.data?.map((item, index) => (
                      <tr
                        key={index}
                        className='border-b'
                      >
                        <td className='py-3 pr-4'>
                          {groupBy === 'status' ? (
                            <span
                              className={getStatusColor(item.group as string)}
                            >
                              {item.group
                                ? (item.group as string)
                                    .charAt(0)
                                    .toUpperCase() +
                                  (item.group as string).slice(1)
                                : ''}
                            </span>
                          ) : (
                            item.label
                          )}
                        </td>
                        <td className='py-3 pr-4 text-right'>{item.count}</td>
                        <td className='py-3 pr-4 text-right'>
                          {formatCurrency(Number(item.total))}
                        </td>
                        <td className='py-3 pr-4 text-right'>
                          {formatCurrency(
                            Number(item.total) / Number(item.count)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
