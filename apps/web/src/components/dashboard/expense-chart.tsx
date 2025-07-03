import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// Define colors for expense categories
const CATEGORY_COLORS: Record<string, string> = {
  Travel: '#8884d8',
  Utility: '#61ca61',
  Grocery: '#ffc658',
  Food: '#d62728',
  Shopping: '#1f77b4',
  Entertainment: '#9467bd',
  Medical: '#ff7f0e',
  Fitness: '#e377c2',
  Services: '#17becf',
  Other: '#7f7f7f',
};

// Type for chart data
interface ChartData {
  category: string;
  amount: number;
  color: string;
}

export const ExpenseChart = () => {
  // Get current month date range - use fixed dates to avoid continuous API calls
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Fetch expense analytics data grouped by category for current month
  const { data, isLoading, error } = useQuery({
    ...trpc.expense.getAnalytics.queryOptions({
      groupBy: 'category',
      startDate: currentMonthStart.toISOString(),
      endDate: currentMonthEnd.toISOString(),
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Transform the data for the pie chart
  const chartData: ChartData[] = data
    ? (data
        .map((item) => {
          try {
            // Ensure the item has a 'category' property
            if ('category' in item) {
              return {
                category: item.category,
                amount: Number(item.total) || 0,
                color: CATEGORY_COLORS[item.category] || '#7f7f7f',
              };
            }
            return null;
          } catch (err) {
            console.error('Error processing chart data:', err);
            return null;
          }
        })
        .filter(Boolean) as ChartData[])
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>
          Your spending breakdown for this month
        </CardDescription>
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
            className='mb-4'
          >
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={true}
                label={({ percent }) =>
                  percent ? `${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='amount'
                nameKey='category'
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`$${value}`, name]} />
              <Legend
                verticalAlign='bottom'
                height={36}
                align='center'
                iconType='circle'
                iconSize={10}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
