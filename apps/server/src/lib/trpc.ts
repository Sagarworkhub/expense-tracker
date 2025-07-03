import { TRPCError, initTRPC } from '@trpc/server';
import { createContext } from './context';
import { isAdmin, userHasRole } from './auth';

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
export const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(isAuthed);

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  const userIsAdmin = await isAdmin(ctx.session.user.id);

  if (!userIsAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Requires admin role',
    });
  }

  return next({ ctx });
});

// Employee procedure - requires user role or admin role
export const employeeProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    const isRegularUser = await userHasRole(ctx.session.user.id, 'user');
    const isUserAdmin = await isAdmin(ctx.session.user.id);

    if (!isRegularUser && !isUserAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Requires user or admin role',
      });
    }

    return next({ ctx });
  }
);
