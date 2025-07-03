import { createFileRoute } from '@tanstack/react-router';
import { AllExpenses } from '@/pages/all-expenses';

export const Route = createFileRoute('/_auth/all-expenses')({
  component: AllExpenses,
});
