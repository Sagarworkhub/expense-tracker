import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { MonthlyExpenseChart } from '@/components/dashboard/monthly-expense-chart';
import { RecentExpenses } from '@/components/dashboard/recent-expenses';
import { StatCard } from '@/components/dashboard/stat-card';
import { CalendarDays, Clock, DollarSignIcon, PieChart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';

export const Dashboard = () => {
  // Get current month date range with validation
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get all expenses
  const { data: expensesResponse, isLoading: loadingAll } = useQuery({
    ...trpc.expense.getAll.queryOptions({}),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
    gcTime: 1000 * 60 * 30,
  });

  const allExpenses = expensesResponse?.data || [];

  // Get expense analytics by category for current month
  const { data: categoryAnalytics, isLoading: loadingAnalytics } = useQuery({
    ...trpc.expense.getAnalytics.queryOptions({
      groupBy: 'category',
      startDate: currentMonthStart.toISOString(),
      endDate: currentMonthEnd.toISOString(),
    }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
    gcTime: 1000 * 60 * 30,
  });

  // Calculate total expenses amount
  const totalExpenses =
    allExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

  // Calculate this month's expenses
  const thisMonthTotal =
    categoryAnalytics?.reduce((sum, item) => sum + Number(item.total), 0) || 0;

  // Count unique categories with expenses this month
  const activeCategories = categoryAnalytics
    ? new Set(
        categoryAnalytics.map((item) =>
          'category' in item ? item.category : ''
        )
      ).size
    : 0;

  // Count pending approvals
  const pendingApprovals =
    allExpenses.filter((expense) => expense.status === 'pending').length || 0;

  // Dashboard data with values
  const dashboardData = [
    {
      title: 'Total Expenses',
      value: totalExpenses,
      icon: <DollarSignIcon className='h-4 w-4 text-muted-foreground' />,
      subtitle: 'All time',
      isAmount: true,
      isLoading: loadingAll,
    },
    {
      title: 'This Month',
      value: thisMonthTotal,
      icon: <CalendarDays className='h-4 w-4 text-muted-foreground' />,
      subtitle: 'Current month',
      isAmount: true,
      isLoading: loadingAnalytics,
    },
    {
      title: 'Categories',
      value: activeCategories,
      icon: <PieChart className='h-4 w-4 text-muted-foreground' />,
      subtitle: 'Active categories',
      isAmount: false,
      isLoading: loadingAnalytics,
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals,
      icon: <Clock className='h-4 w-4 text-muted-foreground' />,
      subtitle: 'Awaiting review',
      isAmount: false,
      isLoading: loadingAll,
    },
  ];

  return (
    <div className='space-y-6 mb-10'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {dashboardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            subtitle={item.subtitle}
            isAmount={item.isAmount}
            isLoading={item.isLoading}
          />
        ))}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <ExpenseChart />
        <MonthlyExpenseChart />
      </div>

      <RecentExpenses />
    </div>
  );
};
