// Common enums for the application

// Expense categories
export const EXPENSE_CATEGORIES = [
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

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// Expense status types
export const EXPENSE_STATUSES = ['pending', 'approved', 'rejected'] as const;

export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];
