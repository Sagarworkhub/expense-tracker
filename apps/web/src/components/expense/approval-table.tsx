import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { queryClient } from '@/utils/trpc';
import { useState } from 'react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  status: string;
  submittedBy: string;
  submittedAt: string;
}

interface ApprovalTableProps {
  expenses: Expense[];
  onApprove: (expenseId: number) => Promise<void>;
  onReject: (expenseId: number) => Promise<void>;
}

export function ApprovalTable({
  expenses,
  onApprove,
  onReject,
}: ApprovalTableProps) {
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: { approving: boolean; rejecting: boolean };
  }>({});

  const handleApprove = async (expenseId: string) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        [expenseId]: { ...prev[expenseId], approving: true },
      }));
      await onApprove(Number(expenseId));
      invalidateAllExpenseQueries();
      toast.success('The expense has been approved successfully.');
    } catch (error) {
      toast.error('Failed to approve expense.');
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [expenseId]: { ...prev[expenseId], approving: false },
      }));
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        [expenseId]: { ...prev[expenseId], rejecting: true },
      }));
      await onReject(Number(expenseId));
      invalidateAllExpenseQueries();
      toast.success('The expense has been rejected successfully.');
    } catch (error) {
      toast.error('Failed to reject expense.');
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [expenseId]: { ...prev[expenseId], rejecting: false },
      }));
    }
  };

  const invalidateAllExpenseQueries = () => {
    // Invalidate all tRPC expense queries
    queryClient.invalidateQueries({ queryKey: [['expense']] });
    queryClient.invalidateQueries({ queryKey: [['expense', 'getAll']] });
    queryClient.invalidateQueries({
      queryKey: [['expense', 'getAllForAdmin']],
    });
    queryClient.invalidateQueries({ queryKey: [['expense', 'getAnalytics']] });
  };

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='font-semibold'>User</TableHead>
            <TableHead className='font-semibold'>Description</TableHead>
            <TableHead className='font-semibold'>Category</TableHead>
            <TableHead className='font-semibold'>Amount</TableHead>
            <TableHead className='font-semibold'>Date</TableHead>
            <TableHead className='font-semibold'>Submitted</TableHead>
            <TableHead className='font-semibold text-right pr-4'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className='font-medium'>
                {expense.submittedBy}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>$ {expense.amount.toFixed(2)}</TableCell>
              <TableCell>{expense.date}</TableCell>
              <TableCell>
                {new Date(expense.submittedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end space-x-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleApprove(expense.id)}
                        disabled={
                          loadingStates[expense.id]?.approving ||
                          loadingStates[expense.id]?.rejecting
                        }
                        className='text-green-600 hover:text-green-700'
                      >
                        {loadingStates[expense.id]?.approving ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Check className='h-4 w-4' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Approve expense</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleReject(expense.id)}
                        disabled={
                          loadingStates[expense.id]?.approving ||
                          loadingStates[expense.id]?.rejecting
                        }
                        className='text-red-600 hover:text-red-700'
                      >
                        {loadingStates[expense.id]?.rejecting ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <X className='h-4 w-4' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reject expense</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
