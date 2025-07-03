import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export const MonthlyExpenseChart = () => {
  // Get data for the last 6 months - use fixed dates to avoid continuous API calls
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  // Fetch expense analytics data grouped by month
  const { data, isLoading, error } = useQuery({
    ...trpc.expense.getAnalytics.queryOptions({
      groupBy: 'month',
      startDate: sixMonthsAgo.toISOString(),
      endDate: today.toISOString(),
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
    gcTime: 1000 * 60 * 30, // 30 minutes (modern replacement for cacheTime)
  });

  // Transform the data for the bar chart
  const chartData = data
    ? data
        .filter((item) => 'month' in item)
        .map((item) => {
          try {
            // Extract month and year from YYYY-MM format
            const monthStr = (item as any).month;
            const [year, month] = monthStr.split('-');

            // Format the month for display (with error handling)
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            const formattedMonth = format(date, 'MMM yyyy');

            return {
              month: formattedMonth,
              total: Number((item as any).total) || 0,
            };
          } catch (err) {
            console.error('Error processing chart data:', err);
            return {
              month: 'Unknown',
              total: 0,
            };
          }
        })
        // Sort by date (oldest to newest)
        .sort((a, b) => {
          try {
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA.getTime() - dateB.getTime();
          } catch (err) {
            return 0;
          }
        })
    : [];

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
        <CardDescription>Expense trends over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center justify-center h-[300px]'>
            <Skeleton className='w-full h-full rounded-md' />
          </div>
        ) : error ? (
          <div className='flex items-center justify-center h-[300px]'>
            <p className='text-destructive'>Failed to load expense data</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex items-center justify-center h-[300px]'>
            <p className='text-muted-foreground'>No expense data available</p>
          </div>
        ) : (
          <ResponsiveContainer
            width='100%'
            height={300}
          >
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
              />
              <XAxis
                dataKey='month'
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(value as number),
                  'Total',
                ]}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Bar
                dataKey='total'
                name='Total Expenses'
                fill='#8884d8'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
