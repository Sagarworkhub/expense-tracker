import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  isAmount: boolean;
  isLoading?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon,
  subtitle,
  isAmount,
  isLoading = false,
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className='h-8 w-20 mb-1' />
            <Skeleton className='h-4 w-24' />
          </>
        ) : (
          <>
            <div className='text-2xl font-bold'>
              {isAmount ? `$${value.toLocaleString()}` : value}
            </div>
            <p className='text-xs text-muted-foreground'>{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
