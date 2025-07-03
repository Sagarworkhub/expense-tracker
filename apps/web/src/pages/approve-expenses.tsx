import { ApprovalTable } from '@/components/expense/approval-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useEffect, useState } from 'react';
import Loader from '@/components/loader';
import { useMutation, useQuery } from '@tanstack/react-query';

// Define the expense type based on the schema
interface Expense {
  id: number;
  description: string;
  amount: string | number; // Can be string from DB but we convert to number for display
  date: string;
  category: string;
  status: string;
  submittedBy: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  userId: string;
}

export const ApproveExpenses = () => {
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [oldestRequest, setOldestRequest] = useState<string>('');

  // Fetch pending expenses
  const { data: expensesData, refetch } = useQuery({
    ...trpc.expense.getAllForAdmin.queryOptions({
      status: 'pending',
      sortBy: 'date',
      sortDirection: 'asc',
    }),
  });

  // Approve expense mutation
  const approveMutation = useMutation({
    ...trpc.expense.approve.mutationOptions({
      onSuccess: () => {
        refetch();
      },
    }),
  });

  // Reject expense mutation
  const rejectMutation = useMutation({
    ...trpc.expense.reject.mutationOptions({
      onSuccess: () => {
        refetch();
      },
    }),
  });

  useEffect(() => {
    if (expensesData) {
      setPendingExpenses(expensesData);
      setIsLoading(false);

      // Calculate oldest request
      if (expensesData.length > 0) {
        const oldest = expensesData[0];
        const oldestDate = new Date(oldest.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - oldestDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setOldestRequest(`${diffDays} days`);
      } else {
        setOldestRequest('0 days');
      }
    }
  }, [expensesData]);

  // Handle approve and reject functions
  const handleApprove = async (expenseId: number) => {
    try {
      await approveMutation.mutateAsync({ id: expenseId });
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleReject = async (expenseId: number) => {
    try {
      await rejectMutation.mutateAsync({ id: expenseId });
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className='flex flex-col min-h-screen mb-10'>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pendingExpenses.length}</div>
            <p className='text-xs text-muted-foreground'>
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              $
              {pendingExpenses
                .reduce((sum, expense) => sum + Number(expense.amount), 0)
                .toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>Pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Oldest Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{oldestRequest}</div>
            <p className='text-xs text-muted-foreground'>Needs attention</p>
          </CardContent>
        </Card>
      </div>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Pending Expenses</CardTitle>
          <CardDescription>
            Review and approve or reject expense submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalTable
            expenses={pendingExpenses.map((expense) => ({
              id: String(expense.id),
              amount: Number(expense.amount),
              category: expense.category,
              description: expense.description,
              date: new Date(expense.date).toLocaleDateString(),
              status: expense.status,
              submittedBy: expense.submittedBy || 'Unknown',
              submittedAt: expense.createdAt,
            }))}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </CardContent>
      </Card>
    </div>
  );
};
