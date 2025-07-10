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
    <Card className='relative overflow-hidden bg-card border-border hover:border-emerald-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 group cursor-pointer'>
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3 relative z-10'>
        <CardTitle className='text-sm font-medium text-muted-foreground group-hover:text-card-foreground transition-colors duration-200'>
          {title}
        </CardTitle>
        <div className='p-2 rounded-lg bg-emerald-primary/10 text-emerald-primary group-hover:bg-emerald-primary/20 group-hover:scale-110 transition-all duration-300'>
          {icon}
        </div>
      </CardHeader>

      <CardContent className='relative z-10'>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-8 w-20 mb-1 bg-muted/50' />
            <Skeleton className='h-4 w-24 bg-muted/30' />
          </div>
        ) : (
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-emerald-primary group-hover:text-emerald-secondary transition-colors duration-300'>
              {isAmount ? `$${value.toLocaleString()}` : value}
            </div>
            {subtitle && (
              <p className='text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200'>
                {subtitle}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
