import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { db } from '../db';
import * as schema from '../db/schema/auth';
import { eq } from 'drizzle-orm';
import { user } from '../db/schema/auth';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ''],
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    admin({
      adminRoles: ['admin'],
      defaultRole: 'user',
    }),
  ],
});

// Helper function to check if a user has a specific role
export async function userHasRole(
  userId: string,
  roleName: string
): Promise<boolean> {
  try {
    const userResult = await db.select().from(user).where(eq(user.id, userId));

    if (userResult.length === 0) {
      return false;
    }

    return userResult[0].role === roleName;
  } catch (error) {
    console.error('Failed to check user role:', error);
    return false;
  }
}

// Helper function to check if a user is an admin
export async function isAdmin(userId: string): Promise<boolean> {
  return userHasRole(userId, 'admin');
}
