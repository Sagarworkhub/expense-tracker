import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BarChart3, Check, Loader2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define expense categories matching the server
const EXPENSE_CATEGORIES = [
  'Travel',
  'Utility',
  'Grocery',
  'Food',
  'Shopping',
  'Entertainment',
  'Medical',
  'Fitness',
  'Services',
  'Other',
] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const Route = createFileRoute('/expenses')({
  component: ExpensesRoute,
});

function ExpensesRoute() {
  const { data: session } = authClient.useSession();
  const { data: userRole } = useQuery({
    ...trpc.user.getRole.queryOptions(),
    enabled: !!session,
  });

  const isAdmin = userRole === 'admin';

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '' as ExpenseCategory,
    notes: '',
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Use different query based on user role
  const expensesQuery = isAdmin
    ? trpc.expense.getAllForAdmin
    : trpc.expense.getAll;

  const expenses = useQuery({
    ...expensesQuery.queryOptions({
      status: statusFilter as 'pending' | 'approved' | 'rejected' | 'all',
      sortBy: sortBy as 'date' | 'amount' | 'description',
      sortDirection: sortDirection as 'asc' | 'desc',
    }),
    enabled: !!session,
  });

  const createMutation = useMutation({
    ...trpc.expense.create.mutationOptions({
      onSuccess: () => {
        expenses.refetch();
        setNewExpense({
          description: '',
          amount: '',
          category: '' as ExpenseCategory,
          notes: '',
        });
        toast.success('Expense added successfully');
      },
      onError: (error) => {
        toast.error(`Failed to add expense: ${error.message}`);
      },
    }),
  });

  const approveMutation = useMutation({
    ...trpc.expense.approve.mutationOptions({
      onSuccess: () => {
        expenses.refetch();
        toast.success('Expense approved');
      },
      onError: (error) => {
        toast.error(`Failed to approve expense: ${error.message}`);
      },
    }),
  });

  const rejectMutation = useMutation({
    ...trpc.expense.reject.mutationOptions({
      onSuccess: () => {
        expenses.refetch();
        toast.success('Expense rejected');
      },
      onError: (error) => {
        toast.error(`Failed to reject expense: ${error.message}`);
      },
    }),
  });

  const deleteMutation = useMutation({
    ...trpc.expense.delete.mutationOptions({
      onSuccess: () => {
        expenses.refetch();
        toast.success('Expense deleted');
      },
      onError: (error) => {
        toast.error(`Failed to delete expense: ${error.message}`);
      },
    }),
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newExpense.description.trim() &&
      newExpense.amount &&
      newExpense.category.trim()
    ) {
      createMutation.mutate({
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
        category: newExpense.category,
        notes: newExpense.notes || undefined,
      });
    }
  };

  const handleApproveExpense = (id: number) => {
    approveMutation.mutate({ id });
  };

  const handleRejectExpense = (id: number) => {
    rejectMutation.mutate({ id });
  };

  const handleDeleteExpense = (id: number) => {
    deleteMutation.mutate({ id });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='mx-auto w-full max-w-4xl py-10'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Expense Tracker</CardTitle>
            <CardDescription>
              {isAdmin
                ? 'Manage and approve team expenses'
                : 'Submit and track your expenses'}
            </CardDescription>
          </div>
          <div className='flex items-center space-x-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                >
                  Status:{' '}
                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                >
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount')}>
                  Amount
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('description')}>
                  Description
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant='ghost'
              size='icon'
              onClick={() =>
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </Button>
            {isAdmin && (
              <Button
                variant='outline'
                size='sm'
                asChild
              >
                <Link to='/dashboard'>
                  <BarChart3 className='mr-2 h-4 w-4' />
                  Team Analytics
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddExpense}
            className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'
          >
            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Input
                id='description'
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
                placeholder='Enter expense description'
                disabled={createMutation.isPending}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='amount'>Amount</Label>
              <Input
                id='amount'
                type='number'
                step='0.01'
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                placeholder='0.00'
                disabled={createMutation.isPending}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value: ExpenseCategory) =>
                  setNewExpense({ ...newExpense, category: value })
                }
                disabled={createMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Input
                id='notes'
                value={newExpense.notes}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, notes: e.target.value })
                }
                placeholder='Any additional notes'
                disabled={createMutation.isPending}
              />
            </div>
            <div className='col-span-full'>
              <Button
                type='submit'
                className='w-full'
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Adding...
                  </>
                ) : (
                  'Add Expense'
                )}
              </Button>
            </div>
          </form>

          {expenses.isLoading ? (
            <div className='flex justify-center py-4'>
              <Loader2 className='h-6 w-6 animate-spin' />
            </div>
          ) : expenses.data?.length === 0 ? (
            <p className='py-4 text-center'>No expenses found.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='pb-2 text-left'>Description</th>
                    <th className='pb-2 text-left'>Category</th>
                    <th className='pb-2 text-left'>Date</th>
                    <th className='pb-2 text-right'>Amount</th>
                    <th className='pb-2 text-center'>Status</th>
                    {isAdmin && <th className='pb-2 text-center'>User</th>}
                    <th className='pb-2 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.data?.map((expense) => (
                    <tr
                      key={expense.id}
                      className='border-b'
                    >
                      <td className='py-3 pr-4'>{expense.description}</td>
                      <td className='py-3 pr-4'>{expense.category}</td>
                      <td className='py-3 pr-4'>
                        {formatDate(expense.date.toString())}
                      </td>
                      <td className='py-3 pr-4 text-right'>
                        {formatCurrency(Number(expense.amount))}
                      </td>
                      <td className='py-3 pr-4 text-center'>
                        <span className={getStatusColor(expense.status)}>
                          {expense.status.charAt(0).toUpperCase() +
                            expense.status.slice(1)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className='py-3 pr-4 text-center'>
                          {expense.userId}
                        </td>
                      )}
                      <td className='py-3 pr-4 text-right'>
                        <div className='flex justify-end space-x-2'>
                          {isAdmin && expense.status === 'pending' && (
                            <>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleApproveExpense(expense.id)}
                                disabled={approveMutation.isPending}
                              >
                                <Check className='h-4 w-4 text-green-500' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleRejectExpense(expense.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <X className='h-4 w-4 text-red-500' />
                              </Button>
                            </>
                          )}
                          {(expense.status === 'pending' || isAdmin) && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className='h-4 w-4 text-red-500' />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
