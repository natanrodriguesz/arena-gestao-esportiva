import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sameOrigin } from '@/lib/session';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
