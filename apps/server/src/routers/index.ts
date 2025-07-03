import { publicProcedure, router } from '../lib/trpc';
import { expenseRouter } from './expense';
import { userRouter } from './user';

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK';
  }),
  expense: expenseRouter,
  user: userRouter,
});
export type AppRouter = typeof appRouter;
