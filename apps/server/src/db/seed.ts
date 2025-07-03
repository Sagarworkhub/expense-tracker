import { db } from './index';
import { user } from './schema/auth';
import { eq } from 'drizzle-orm';
import { auth } from '../lib/auth';

/**
 * Set a user as admin
 */
export async function setUserAsAdmin(userId: string) {
  try {
    // Check if user exists
    const userResult = await db.select().from(user).where(eq(user.id, userId));

    if (userResult.length === 0) {
      throw new Error(`User not found: ${userId}`);
    }

    // Use Better Auth admin plugin to set role
    await auth.api.setRole({
      body: {
        userId,
        role: 'admin',
      },
    });

    console.log(`[ADMIN ROLE] User ID: ${userId} set as admin`);
    return true;
  } catch (error) {
    console.error('Failed to set user as admin:', error);
    return false;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  console.log('No seeding required for Better Auth RBAC');
  process.exit(0);
}
