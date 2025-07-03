import { relations } from 'drizzle-orm';
import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../../lib/enums';
import { user } from './auth';

export const expenseStatusEnum = pgEnum('expense_status', EXPENSE_STATUSES);

export const expenseCategoryEnum = pgEnum(
  'expense_category',
  EXPENSE_CATEGORIES
);

export const expense = pgTable('expense', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  category: expenseCategoryEnum('category').notNull(),
  status: expenseStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenseRelations = relations(expense, ({ one }) => ({
  user: one(user, {
    fields: [expense.userId],
    references: [user.id],
  }),
}));
