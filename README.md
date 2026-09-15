# Arena — MVP de gestão esportiva

Aplicação em português com painel de gestão, alternância entre treinador e jogador, elenco, avaliações, treinos individuais e coletivos, rotina alimentar, escalações por modalidade, calendário e controle de mensalidades ou contratos.

## Recursos
- Futebol (11), futsal (5), basquete (5), vôlei (6) e handebol (7), com quadras próprias.
- Edição de dados pelo treinador; conclusão de treinos e confirmação de eventos na visão do atleta.
- Notas de técnica, tática, físico e disciplina, feedback e gráfico de evolução calculado a partir dos registros.
- Formulários acessíveis, confirmação de exclusão, validação de entradas e interface adaptável ao celular.
- Dados persistidos em Cloudflare D1, separados pelo usuário autenticado, com controle de revisão para impedir sobrescritas entre abas.

## Escopo do MVP
O proprietário acessa um ambiente privado e alterna entre os perfis para demonstrar os fluxos. A seleção de treinador/jogador não constitui um sistema de contas e permissões independentes. Um time compartilhado por usuários diferentes, convites e vínculos de acesso requerem a próxima etapa do produto.

Mensalidades são registros de recebimentos. Não há checkout, cobrança Pix, cartão ou movimentação de dinheiro. Contratos são registros de datas e observações, sem assinatura digital. A alimentação inicial contém exemplos, para substituição pelo plano do nutricionista.

Os dados iniciais são demonstrativos e editáveis. Eles são inseridos apenas na primeira abertura do ambiente de cada usuário. O navegador guarda somente a preferência visual de perfil; os registros ficam no banco.

## Desenvolvimento
Requer Node.js 22.13+ e npm.

1. `npm run install:ci`
2. `npm run build`
3. `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_closed_lord_tyger.sql`
4. `npm run dev`
5. Acesse `http://localhost:5173/`. O ambiente local simula a entrada do proprietário.

Para alterar o esquema: edite `db/schema.ts`, execute `npm run db:generate` e aplique somente as novas migrações. Não reexecute migrações já aplicadas.

## Estrutura
- `components/arena-app.tsx`: painel, navegação e telas.
- `components/arena-editor.tsx`: formulários.
- `components/arena-lineup.tsx`: quadras e escalações.
- `lib/team.ts`: dados iniciais, tipos, validação e posições.
- `app/api/team/route.ts`: API autenticada e controle de revisão.
- `db/`: acesso ao D1 e esquema.
- `app/globals.css`: identidade visual e adaptação de telas.

## Verificações realizadas
Compilação de produção e TypeScript sem erros. API local validada em leitura, gravação, recarga, conflito de revisão, nota fora do intervalo, referência a atleta inexistente, autenticação ausente e origem inválida. Interface inspecionada no navegador. Ferramentas WebMCP de resumo e navegação verificadas com entrada válida e navegação inválida.
