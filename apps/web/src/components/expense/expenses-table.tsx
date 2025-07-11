import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ExpensesTableProps {
  expenses?: {
    id: number;
    description: string;
    category: string;
    amount: string;
    date: string;
    status: string;
    submittedBy?: string | null;
    userId?: string;
  }[];
}

export const ExpensesTable = ({ expenses = [] }: ExpensesTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant='default'>Approved</Badge>;
      case 'pending':
        return <Badge variant='secondary'>Pending</Badge>;
      case 'rejected':
        return <Badge variant='destructive'>Rejected</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='font-semibold'>Description</TableHead>
            <TableHead className='font-semibold'>Category</TableHead>
            <TableHead className='font-semibold'>Date</TableHead>
            <TableHead className='font-semibold'>Status</TableHead>
            <TableHead className='font-semibold'>Submitted By</TableHead>
            <TableHead className='font-semibold text-right pr-4'>
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className='font-medium'>
                {expense.description}
              </TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{getStatusBadge(expense.status)}</TableCell>
              <TableCell>{expense.submittedBy || expense.userId}</TableCell>
              <TableCell className='text-right'>
                $ {Number(expense.amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
