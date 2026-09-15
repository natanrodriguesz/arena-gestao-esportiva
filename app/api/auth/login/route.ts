import { NextResponse } from 'next/server';
import { authConfigured, createSession, SESSION_COOKIE, SESSION_SECONDS, sameOrigin, verifyPassword } from '@/lib/session';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  if (!authConfigured()) return NextResponse.json({ error: 'O acesso ainda está sendo configurado pelo responsável pelo site.' }, { status: 503 });
  if (Number(request.headers.get('content-length') || 0) > 2048) return new Response(null, { status: 413 });
  let password: unknown;
  try {
    const text = await request.text();
    if (text.length > 2048) return new Response(null, { status: 413 });
    password = JSON.parse(text).password;
  } catch { return NextResponse.json({ error: 'Dados de acesso inválidos.' }, { status: 400 }); }
  if (typeof password !== 'string' || !verifyPassword(password)) return NextResponse.json({ error: 'Chave de acesso incorreta.' }, { status: 401 });
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(SESSION_COOKIE, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS });
  return response;
}
