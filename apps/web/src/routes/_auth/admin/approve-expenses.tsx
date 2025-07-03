import { createFileRoute } from '@tanstack/react-router';
import { ApproveExpenses } from '@/pages/approve-expenses';

export const Route = createFileRoute('/_auth/admin/approve-expenses')({
  component: ApproveExpenses,
});
