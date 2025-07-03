import { protectedProcedure, router } from '../lib/trpc';

export const userRouter = router({
  // Get current user's role
  getRole: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user.role || 'user';
  }),
});
