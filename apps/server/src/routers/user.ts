import { TRPCError } from '@trpc/server';
import z from 'zod/v4';
import { auth } from '../lib/auth';
import { adminProcedure, protectedProcedure, router } from '../lib/trpc';

export const userRouter = router({
  // Get current user's role
  getRole: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user.role || 'user';
  }),

  // Admin-only: Get all users with their roles
  getAll: adminProcedure.query(async () => {
    try {
      const result = await auth.api.listUsers({
        query: {
          limit: 100,
        },
      });

      return result.users;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch users',
      });
    }
  }),

  // Admin-only: Assign role to user
  assignRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        roleName: z.enum(['admin', 'user']),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, roleName } = input;

      try {
        await auth.api.setRole({
          body: {
            userId,
            role: roleName,
          },
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to assign role',
        });
      }
    }),

  // Admin-only: Ban a user
  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, banReason } = input;

      try {
        await auth.api.banUser({
          body: {
            userId,
            banReason: banReason || 'No reason provided',
          },
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to ban user',
        });
      }
    }),

  // Admin-only: Unban a user
  unbanUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId } = input;

      try {
        await auth.api.unbanUser({
          body: {
            userId,
          },
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to unban user',
        });
      }
    }),
});
