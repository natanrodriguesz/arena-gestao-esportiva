import ArenaApp from '@/components/arena-app';
import { requireArenaUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function Home() { await requireArenaUser(); return <ArenaApp/>; }
