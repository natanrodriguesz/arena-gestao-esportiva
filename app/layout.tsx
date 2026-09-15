import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Arena • Gestão esportiva',description:'Seu time em movimento. Gerencie atletas, treinos, escalações e eventos em um só lugar.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
