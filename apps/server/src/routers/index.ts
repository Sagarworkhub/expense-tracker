import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import { expenseRouter } from './expense';
import { userRouter } from './user';

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK';
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      user: ctx.session.user,
    };
  }),
  expense: expenseRouter,
  user: userRouter,
});
export type AppRouter = typeof appRouter;
