import { TRPCError } from '@trpc/server';
import {
  and,
  asc,
  between,
  count,
  desc,
  eq,
  gt,
  ilike,
  lt,
  sql,
  sum,
} from 'drizzle-orm';
import z from 'zod/v4';
import { db } from '../db';
import { expense } from '../db/schema/expense';
import { user } from '../db/schema/auth';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../lib/enums';
import {
  adminProcedure,
  employeeProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from '../lib/trpc';

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(EXPENSE_CATEGORIES, {
    message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
  }),
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  notes: z.string().optional(),
});

export const expenseRouter = router({
  getAll: employeeProcedure
    .input(
      z.object({
        status: z
          .enum([...EXPENSE_STATUSES, 'all'])
          .optional()
          .default('all'),
        category: z
          .enum([...EXPENSE_CATEGORIES, 'All'])
          .optional()
          .default('All'),
        searchTerm: z.string().optional().default(''),
        dateFrom: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        dateTo: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        sortBy: z
          .enum(['date', 'amount', 'description'])
          .optional()
          .default('date'),
        sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'admin';

      // Build where conditions
      const whereConditions = [];

      // Only filter by userId if not an admin
      if (!isAdmin) {
        whereConditions.push(eq(expense.userId, userId));
      }

      // Filter by status
      if (input.status !== 'all') {
        whereConditions.push(eq(expense.status, input.status));
      }

      // Filter by category
      if (input.category !== 'All') {
        whereConditions.push(eq(expense.category, input.category));
      }

      // Filter by search term (search in description)
      if (input.searchTerm && input.searchTerm.trim() !== '') {
        whereConditions.push(
          ilike(expense.description, `%${input.searchTerm.trim()}%`)
        );
      }

      // Filter by date range
      if (input.dateFrom && input.dateTo) {
        whereConditions.push(
          between(expense.date, input.dateFrom, input.dateTo)
        );
      } else if (input.dateFrom) {
        whereConditions.push(gt(expense.date, input.dateFrom));
      } else if (input.dateTo) {
        whereConditions.push(lt(expense.date, input.dateTo));
      }

      // Determine order by
      let orderByFn = input.sortDirection === 'asc' ? asc : desc;
      let orderByColumn;

      if (input.sortBy === 'amount') {
        orderByColumn = expense.amount;
      } else if (input.sortBy === 'description') {
        orderByColumn = expense.description;
      } else {
        orderByColumn = expense.date;
      }

      // Build complete query with all conditions
      const query =
        whereConditions.length > 0
          ? db
              .select({
                id: expense.id,
                description: expense.description,
                amount: expense.amount,
                date: expense.date,
                userId: expense.userId,
                category: expense.category,
                status: expense.status,
                notes: expense.notes,
                createdAt: expense.createdAt,
                updatedAt: expense.updatedAt,
                submittedBy: user.name,
              })
              .from(expense)
              .leftJoin(user, eq(expense.userId, user.id))
              .where(and(...whereConditions))
              .orderBy(orderByFn(orderByColumn))
          : db
              .select({
                id: expense.id,
                description: expense.description,
                amount: expense.amount,
                date: expense.date,
                userId: expense.userId,
                category: expense.category,
                status: expense.status,
                notes: expense.notes,
                createdAt: expense.createdAt,
                updatedAt: expense.updatedAt,
                submittedBy: user.name,
              })
              .from(expense)
              .leftJoin(user, eq(expense.userId, user.id))
              .orderBy(orderByFn(orderByColumn));

      // Get total count first
      const countResult = await (whereConditions.length > 0
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(expense)
            .where(and(...whereConditions))
        : db.select({ count: sql<number>`count(*)` }).from(expense));
      const totalCount = Number(countResult[0].count);

      // Apply pagination if provided
      let results;
      if (input.limit !== undefined && input.offset !== undefined) {
        results = await query.limit(input.limit).offset(input.offset);
      } else if (input.limit !== undefined) {
        results = await query.limit(input.limit);
      } else if (input.offset !== undefined) {
        results = await query.offset(input.offset);
      } else {
        results = await query;
      }

      return {
        data: results,
        pagination: {
          total: totalCount,
          pageSize: input.limit || results.length,
          currentPage: input.offset
            ? Math.floor(input.offset / (input.limit || 10))
            : 0,
        },
      };
    }),

  // Admin endpoint to get all expenses from all users
  getAllForAdmin: adminProcedure
    .input(
      z.object({
        status: z
          .enum([...EXPENSE_STATUSES, 'all'])
          .optional()
          .default('all'),
        sortBy: z
          .enum(['date', 'amount', 'description'])
          .optional()
          .default('date'),
        sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Build where conditions
      const whereConditions = [];

      if (input.status !== 'all') {
        whereConditions.push(eq(expense.status, input.status));
      }

      // Determine order by
      let orderByFn = input.sortDirection === 'asc' ? asc : desc;
      let orderByColumn;

      if (input.sortBy === 'amount') {
        orderByColumn = expense.amount;
      } else if (input.sortBy === 'description') {
        orderByColumn = expense.description;
      } else {
        orderByColumn = expense.date;
      }

      const query = db
        .select({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          userId: expense.userId,
          category: expense.category,
          status: expense.status,
          notes: expense.notes,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
          submittedBy: user.name,
        })
        .from(expense)
        .leftJoin(user, eq(expense.userId, user.id));

      if (whereConditions.length > 0) {
        query.where(and(...whereConditions));
      }

      return await query.orderBy(orderByFn(orderByColumn));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isUserAdmin = ctx.session.user.role === 'admin';

      // If admin, can view any expense
      const whereConditions = [eq(expense.id, input.id)];
      if (!isUserAdmin) {
        whereConditions.push(eq(expense.userId, userId));
      }

      const result = await db
        .select({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          userId: expense.userId,
          category: expense.category,
          status: expense.status,
          notes: expense.notes,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
          submittedBy: user.name,
        })
        .from(expense)
        .leftJoin(user, eq(expense.userId, user.id))
        .where(and(...whereConditions));

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      return result[0];
    }),

  create: employeeProcedure
    .input(expenseSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await db
        .insert(expense)
        .values({
          description: input.description,
          amount: input.amount.toString(),
          userId: userId,
          category: input.category,
          date: input.date || new Date(),
          notes: input.notes || null,
        })
        .returning({
          id: expense.id,
        });
    }),

  update: employeeProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().min(1, 'Description is required').optional(),
        amount: z.number().positive('Amount must be positive').optional(),
        category: z
          .enum(EXPENSE_CATEGORIES, {
            message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
          })
          .optional(),
        date: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First check if expense exists and belongs to user
      const existingExpense = await db
        .select()
        .from(expense)
        .where(and(eq(expense.id, input.id), eq(expense.userId, userId)));

      if (existingExpense.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      // Don't allow updating if already approved/rejected
      if (existingExpense[0].status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot update expense with status: ${existingExpense[0].status}`,
        });
      }

      const updateData: any = {};
      if (input.description) updateData.description = input.description;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.category) updateData.category = input.category;
      if (input.date) updateData.date = input.date;
      if (input.notes !== undefined) updateData.notes = input.notes;
      updateData.updatedAt = new Date();

      return await db
        .update(expense)
        .set(updateData)
        .where(and(eq(expense.id, input.id), eq(expense.userId, userId)))
        .returning();
    }),

  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Only admin can approve expenses
      const result = await db
        .update(expense)
        .set({
          status: 'approved',
          updatedAt: new Date(),
        })
        .where(eq(expense.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      return result[0];
    }),

  reject: adminProcedure
    .input(
      z.object({
        id: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admin can reject expenses
      const updateData: any = {
        status: 'rejected',
        updatedAt: new Date(),
      };

      if (input.notes) {
        updateData.notes = input.notes;
      }

      const result = await db
        .update(expense)
        .set(updateData)
        .where(eq(expense.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = ctx.session.user.role === 'admin';

      // Admin can delete any expense, regular users only their own
      const whereConditions = [eq(expense.id, input.id)];
      if (!isAdmin) {
        whereConditions.push(eq(expense.userId, userId));
      }

      const existingExpense = await db
        .select()
        .from(expense)
        .where(and(...whereConditions));

      if (existingExpense.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      return await db
        .delete(expense)
        .where(and(...whereConditions))
        .returning();
    }),

  getAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        endDate: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        groupBy: z
          .enum(['category', 'status', 'day', 'month', 'year'])
          .optional()
          .default('category'),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Base query with user filter
      const baseWhere = eq(expense.userId, userId);
      let whereConditions = [baseWhere];

      // Add date filters if provided
      if (input.startDate && input.endDate) {
        whereConditions.push(
          between(expense.date, input.startDate, input.endDate)
        );
      } else if (input.startDate) {
        whereConditions.push(gt(expense.date, input.startDate));
      } else if (input.endDate) {
        whereConditions.push(lt(expense.date, input.endDate));
      }

      // Create the appropriate query based on groupBy
      let query;
      if (input.groupBy === 'category') {
        query = db
          .select({
            category: expense.category,
            count: count(),
            total: sql<number>`sum(${expense.amount}::numeric)`,
          })
          .from(expense)
          .where(and(...whereConditions))
          .groupBy(expense.category);
      } else if (input.groupBy === 'status') {
        query = db
          .select({
            status: expense.status,
            count: count(),
            total: sql<number>`sum(${expense.amount}::numeric)`,
          })
          .from(expense)
          .where(and(...whereConditions))
          .groupBy(expense.status);
      } else if (input.groupBy === 'day') {
        query = db
          .select({
            day: sql<string>`to_char(${expense.date}, 'YYYY-MM-DD')`,
            count: count(),
            total: sql<number>`sum(${expense.amount}::numeric)`,
          })
          .from(expense)
          .where(and(...whereConditions))
          .groupBy(sql`to_char(${expense.date}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${expense.date}, 'YYYY-MM-DD')`);
      } else if (input.groupBy === 'month') {
        query = db
          .select({
            month: sql<string>`to_char(${expense.date}, 'YYYY-MM')`,
            count: count(),
            total: sql<number>`sum(${expense.amount}::numeric)`,
          })
          .from(expense)
          .where(and(...whereConditions))
          .groupBy(sql`to_char(${expense.date}, 'YYYY-MM')`)
          .orderBy(sql`to_char(${expense.date}, 'YYYY-MM')`);
      } else if (input.groupBy === 'year') {
        query = db
          .select({
            year: sql<string>`to_char(${expense.date}, 'YYYY')`,
            count: count(),
            total: sql<number>`sum(${expense.amount}::numeric)`,
          })
          .from(expense)
          .where(and(...whereConditions))
          .groupBy(sql`to_char(${expense.date}, 'YYYY')`)
          .orderBy(sql`to_char(${expense.date}, 'YYYY')`);
      }

      return await query;
    }),

  // Team analytics - admin only
  getTeamAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        endDate: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
        groupBy: z
          .enum(['category', 'status', 'day', 'month', 'year', 'user'])
          .optional()
          .default('category'),
      })
    )
    .query(async ({ input }) => {
      // Build where conditions for date range
      const whereConditions = [];

      if (input.startDate) {
        whereConditions.push(gt(expense.date, input.startDate));
      }

      if (input.endDate) {
        whereConditions.push(lt(expense.date, input.endDate));
      }

      // Different grouping based on the groupBy parameter
      let groupByColumn;
      let selectObj: any = {};

      if (input.groupBy === 'category') {
        groupByColumn = expense.category;
        selectObj = {
          group: expense.category,
          label: expense.category,
        };
      } else if (input.groupBy === 'status') {
        groupByColumn = expense.status;
        selectObj = {
          group: expense.status,
          label: expense.status,
        };
      } else if (input.groupBy === 'user') {
        groupByColumn = expense.userId;
        selectObj = {
          group: expense.userId,
          label: expense.userId,
        };
      } else {
        // Time-based grouping
        let dateFormat = '';

        if (input.groupBy === 'day') {
          dateFormat = 'YYYY-MM-DD';
        } else if (input.groupBy === 'month') {
          dateFormat = 'YYYY-MM';
        } else if (input.groupBy === 'year') {
          dateFormat = 'YYYY';
        }

        groupByColumn = sql`to_char(${expense.date}, ${dateFormat})`;
        selectObj = {
          group: sql`to_char(${expense.date}, ${dateFormat})`,
          label: sql`to_char(${expense.date}, ${dateFormat})`,
        };
      }

      // Add count and sum to select
      selectObj.count = count();
      selectObj.total = sum(expense.amount);

      // Build and execute query
      const query = db.select(selectObj).from(expense);

      if (whereConditions.length > 0) {
        query.where(and(...whereConditions));
      }

      return await query
        .groupBy(groupByColumn)
        .orderBy(desc(sum(expense.amount)));
    }),
});
