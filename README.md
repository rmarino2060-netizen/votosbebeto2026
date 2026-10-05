# Votos Bebeto Federal - 2026

Site estático e responsivo de análise independente da votação de Bebeto (1133, PP), deputado federal pelo Rio de Janeiro. Base extraída dos arquivos oficiais do TSE em 05/10/2026. Não é um serviço oficial do TSE.

## Conteúdo

- Total estadual: 52.761 votos.
- 92 municípios e 183 combinações de município e zona eleitoral.
- Três maiores concentrações estaduais, consulta por município/zona, seleções predefinidas de município/zona e maiores votações, ranking, paginação e links oficiais.
- Modo claro/escuro com preferência lembrada no navegador.
- PDF completo e geração local de PDF da consulta. Biblioteca de PDF incluída no projeto, sem CDN ou serviço externo.
- Compartilhamento da consulta por parâmetros no endereço. Sem rastreamento, contas de visitantes ou banco em servidor.

Zona não equivale a bairro. Seções, locais de votação, endereços e limites territoriais não fazem parte da base atual. Não inferir residência nem identidade dos eleitores.

## Organização

`public/data/`: metadados e bases JSON. `public/index.html`, `styles.css`, `app.js`: interface. `filters.js`: consulta. `pdf.js`: relatório. `public/relatorios/`: PDF completo e relatório original com todas as fontes. `public/vendor/`: pdf-lib 1.17.1 (MIT).

## Desenvolvimento

Requer Node.js 18 ou superior para build e testes; o site publicado não usa Node ou servidor próprio. Não é necessário instalar dependências.

```sh
npm test
npm run build
```

Para editar/testar, execute `npm run dev` e abra http://localhost:8080. O servidor serve `public`; atualize o navegador após alterar arquivos. Para conferir a versão preparada pelo build, execute `npm run preview`, que serve `dist`. Ambos usam Node.js e funcionam em Windows e Linux, sem Python ou dependências extras. Encerre com Ctrl+C antes de trocar de servidor. Para regenerar o PDF completo após mudar os dados: `node scripts/report.mjs`, seguido de `npm run build`.

## Conexão entre GitHub e computador

Uma pasta baixada por ZIP não tem a conexão Git. Preserve sua cópia atual e clone em outra pasta:

```powershell
cd C:\_estudos
git clone https://github.com/rmarino2060-netizen/votosbebeto2026.git
cd votosbebeto2026
git remote -v
npm run dev
```

O clone configura `origin` e a branch `main` automaticamente. Antes de receber novas alterações, encerre o servidor (Ctrl+C) e execute, dentro dessa pasta:

```powershell
git status
git pull --ff-only
npm test
npm run dev
```

Após mudanças remotas, é preciso fazer o pull antes de testar a nova versão. Para testar a saída da publicação: `npm run build` e `npm run preview`. Se o Git avisar sobre alterações locais ou divergência, resolva essas alterações antes de continuar; não use comandos para descartar arquivos automaticamente. O ZIP antigo não é atualizado pelo pull.

Se a Cloudflare já estiver conectada à branch main, alterações enviadas ao remoto podem disparar publicação automática. Nesta fase, revise o site local antes de conectar a hospedagem.

## Publicação na sua conta Cloudflare Pages

Antes da publicação, revise o site em celular e computador. A validação desta primeira versão incluiu testes automatizados de dados e filtros, build, análise de sintaxe JavaScript e revisão visual das 16 páginas do PDF completo. O teste de navegação/renderização no navegador ficou pendente porque o ambiente de construção bloqueou a prévia e não disponibilizou um navegador local funcional. Não tratar esta versão como homologada visualmente antes dessa revisão.

Crie um projeto **Pages** com integração Git e selecione este repositório. Configuração:

| Campo | Valor |
|---|---|
| Nome pretendido | votosbebeto2026 |
| Branch de produção | main |
| Framework | None |
| Comando de build | npm run build |
| Diretório de saída | dist |
| Diretório raiz | / (raiz do repositório) |

Use o plano gratuito. Não é necessário comprar domínio nem contratar recursos pagos. O endereço pretendido é `votosbebeto2026.pages.dev`, sujeito à disponibilidade. O projeto Pages e o repositório devem continuar na conta do proprietário. Não envie senha ou token em arquivos ou mensagens.

A publicação deve acontecer depois da revisão do site. Após conectar, novos commits na branch de produção poderão disparar novos deploys. Use branches/PRs para revisar alterações antes de atualizar `main`.

## Manutenção dos dados

Para revisões, atualize os JSONs com resultados oficiais, preserve as URLs das fontes, altere `dataColeta` e `versao` e rode os testes. Regere o PDF completo e o relatório de fontes para não manter versões divergentes. Os testes exigem a estrutura e o total desta eleição; se o TSE revisar o total, atualize os controles conscientemente e documente o motivo. Não misture pleitos, candidatos ou turnos.

Fonte estadual: https://resultados.tse.jus.br/oficial/ele2026/6259/dados/rj/rj-c0006-e006259-u.json

Configuração municipal: https://resultados.tse.jus.br/oficial/ele2026/6259/config/mun-e006259-cm.json

Cada registro de resultado contém sua própria URL oficial. Percentuais são calculados sobre os votos do candidato; não sobre todos os votos válidos da localidade. Municípios e zonas são duas visões dos mesmos votos e não devem ser somados entre si.
