import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, validSession } from './session';

export async function getArenaUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return validSession(token) ? { userId: 'owner' } : null;
}

export async function requireArenaUser() {
  if (!(await getArenaUser())) redirect('/login');
}
