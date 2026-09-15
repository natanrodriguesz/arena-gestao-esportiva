# Arena — MVP de gestão esportiva

Aplicação em português, preparada para **Next.js na Vercel**. Inclui treinador/jogador, elenco, avaliações, treinos, alimentação, escalações por esporte, calendário, mensalidades e contratos.

## Deploy na Vercel

1. Importe o repositório `natanrodriguesz/arena-gestao-esportiva` na sua conta Vercel.
2. O arquivo `vercel.json` define Next.js, instalação com `npm ci`, compilação com `npm run build` e funções em São Paulo (`gru1`).
3. Gere as credenciais localmente com `node scripts/create-access.mjs`. O comando cria `.env.local` e um arquivo privado com a chave do painel em `outputs/arena-acesso-privado.txt`. Ele não sobrescreve credenciais existentes.
4. Adicione as variáveis `ARENA_ADMIN_PASSWORD_HASH` e `ARENA_SESSION_SECRET` do arquivo `.env.local` nas configurações da Vercel. Não coloque a chave de acesso nem as variáveis no GitHub.
5. Crie um armazenamento **Vercel Blob privado** e conecte-o ao projeto. A conexão fornece `BLOB_READ_WRITE_TOKEN` ou as credenciais OIDC do Blob. Use um armazenamento diferente para Production e Preview, evitando que testes modifiquem o time de produção.
6. Não configure `ARENA_STORAGE=local` na Vercel. Ela é exclusiva do desenvolvimento local.
7. Publique e use a chave privada para entrar no painel.

O projeto mantém o acesso fechado até as credenciais serem configuradas. O armazenamento também precisa estar conectado para carregar o time. Não usa as URLs de autenticação do ChatGPT nem o runtime Cloudflare na versão Vercel.

## Desenvolvimento local

Requer Node.js 22.13+ (recomendado: 24) e npm.

```text
npm ci
node scripts/create-access.mjs
npm run dev
```

Acesse `http://localhost:3000/` e use a chave do arquivo privado. O desenvolvimento persiste os registros em `.arena/development.sqlite`. A pasta é ignorada pelo Git. A versão de produção usa exclusivamente o Blob privado. O banco D1 antigo em `.wrangler/` permanece preservado localmente, mas não é migrado automaticamente para o novo armazenamento.

## Dados e proteção de acesso

- Dados reais do produto ficam no servidor. O navegador guarda somente a preferência de visualização.
- O armazenamento Blob usa leitura sem cache e gravações condicionadas ao ETag para impedir sobrescritas entre abas.
- Os exemplos são criados somente quando ainda não existe um time no armazenamento conectado.
- A chave de acesso é validada com scrypt; a sessão é assinada, tem validade de sete dias e usa cookie HttpOnly, SameSite=Lax e Secure em produção.
- Rotas de gravação verificam autenticação, origem e conteúdo. Configuração ausente fecha o acesso.
- O acesso é do proprietário. A troca treinador/jogador demonstra os fluxos; não representa contas e permissões independentes para cada atleta.

## Recursos

Futebol (11), futsal (5), basquete (5), vôlei (6) e handebol (7), com quadras próprias. O treinador edita os registros. A visão do jogador mostra suas tarefas e permite concluir treinos e confirmar eventos. Avaliações contemplam técnica, tática, físico, disciplina e feedback.

Mensalidades são controle de recebimentos, sem checkout, Pix automático ou movimentação de dinheiro. Contratos registram datas e observações, sem assinatura digital. A alimentação inicial contém exemplos editáveis para substituição pelo plano do nutricionista.

## Estrutura

- `components/arena-app.tsx`: painel e telas.
- `components/arena-editor.tsx`: formulários.
- `components/arena-lineup.tsx`: quadras e escalações.
- `lib/team.ts`: tipos, validação, dados iniciais e posições.
- `lib/auth.ts` e `lib/session.ts`: acesso privado e sessões.
- `app/api/team/route.ts`: API autenticada e validação.
- `db/team-store.ts`: persistência no Blob e controle de concorrência.
- `db/local-store.ts`: SQLite exclusivo do desenvolvimento local.
- `app/globals.css`: identidade visual e responsividade.

## Referências

[Next.js na Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) · [Armazenamento privado](https://vercel.com/docs/vercel-blob/private-storage) · [SDK Blob e gravações condicionais](https://vercel.com/docs/vercel-blob/using-blob-sdk)
