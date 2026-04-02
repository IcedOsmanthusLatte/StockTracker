import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const USER_COOKIE_NAME = 'stock_tracker_user_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  let userId = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (!userId) {
    userId = uuidv4();
    cookieStore.set(USER_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return userId;
}

export async function clearUserId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}
