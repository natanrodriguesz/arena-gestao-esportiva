"use client";
import { useState } from 'react';
import { ShieldCheck, ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function Login() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Não foi possível entrar.');
      window.location.assign('/');
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.'); setBusy(false); }
  }
  return <main className="loginpage"><section className="loginbrand"><a className="brand" href="/" aria-label="Arena"><span className="brandmark">a</span>arena<span className="branddot">.</span></a><div><span className="eyebrow">SEU TIME, EM SINTONIA</span><h1>O próximo nível<br/>começa no time<span>.</span></h1><p>Treinos, evolução e próximos desafios.<br/>Tudo pronto para entrar em jogo.</p></div><small>arena · Gestão esportiva</small></section><section className="logincontent"><form onSubmit={submit} className="loginform"><span className="loginshield"><ShieldCheck size={27}/></span><h2>Bem-vindo ao Arena</h2><p>Entre para acessar seu time.</p><label className="field"><span>Chave de acesso</span><input type="password" name="password" autoComplete="current-password" required maxLength={256} value={password} onChange={event=>setPassword(event.target.value)} placeholder="Sua chave privada"/></label>{error&&<div className="formerror" role="alert">{error}</div>}<Button className="primary" type="submit" disabled={busy}>{busy?<><LoaderCircle size={17}/>Entrando…</>:<>Entrar no time<ArrowRight size={17}/></>}</Button><small>Ambiente privado do projeto. Use a chave fornecida pelo responsável.</small></form></section></main>;
}
